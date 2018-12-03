# Pod Scheduling

Modificando el spec de un Pod es posible influir en las decisiones tomadas por el Scheduling de Kubernetes.

Durante la creación del **spec** exiten las siguientes tipos de directivas que se pueden utilizar para definir el comportamiento del Scheduling de un Pod:

* nodeSelector: Labels de los nodos deseados..
* nodeName: String.
* affinity: Objetio tipo *Affinity*.
* tolerations: Array.

## nodeName

Se explicita el nombre del nodo en el spec.

## nodeSelector

Los nodos, al igual que los pods, pueden poseer **labes**:

```
kubectl label nodes node1 tier=prod
kubectl label nodes node2 tier=dev
kubectl get nodes --show-labels
```

Durante la creación del **spec** de un Pod se debe agregar la etiqueta con que deseamos se elija el nodo.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-example-affi
  namespace: default
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  revisionHistoryLimit: 4
  replicas: 4
  minReadySeconds: 20
  selector:
    matchLabels:
      app: nodejs-affi
  template:
    metadata:
      labels:
        app: nodejs-affi
        role: example
        version: v1
    spec:
      nodeSelector:
        tier: dev
      volumes:
        - name: shared-lock
          emptyDir: {}
      initContainers:
        - name: createlock
          image: busybox
          command: ["sh", "-c", "touch /shared/key.lock && echo Lock creado"]
          volumeMounts:
            - mountPath: /shared
              name: shared-lock
      containers:
        - name: app
          image: semoac/nodejs-example:latest
          command: ["bash", "/app/checklock.sh"]
          volumeMounts:
            - mountPath: /shared
              name: shared-lock
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              protocol: TCP
          env:
            - name: PORT
              value: "3000"
            - name: NS
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: HEALTH_STATUS
              value: "200"
          livenessProbe:
            tcpSocket:
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 3
```

Podemos comprobar la selección ejecutando

```
kubectl get pods -o wide
kubectl get nodes -l tier=dev
```

## Affinity

Este tipo de estrategias permiten definir reglas blandas y duras mas complejas. El Scheduler intentará complir con reglas de *Afinidad* o *AntiAfinidad* de la mejor forma posible.

Existen 3 tipos de afinidad:
* nodeAffinity
* podAffinity
* podAntiAffinity

Las reglas pueden ser del tipo

* required (duras)
  * DuringSchedulingIgnoredDuringExecution
  * DuringExecutionIgnoredDuringExecution
* preferred (blandas)
  * DuringSchedulingIgnoredDuringExecution
  * DuringExecutionIgnoredDuringExecution

Finalmente, los operadores para definir los requrimientos son los siguientes:

* In
* NotIn
* Exists
* DoesNotExist
* Gt
* Lt

### nodeAffinity

Esta afinidad se utiliza para elegir nodos.

Por ejemplo: *Lanzar la aplicación redis en los mismo nodos la aplicación NodeJS pero en un nodo disinto a otro Redis".*

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: app
      image: nginx:latest
      ports:
        - containerPort: 80
          protocol: TCP
  affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: tier
                operator: DoesNotExist
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 1
              preference:
                matchExpressions:
                - key: nginx
                  operator: Exists
```


### podAffinity

Este tipo de afinidad permite agrupar pods en los nodos. Esto es util cuando queremos, por ejemplo, agrupar Pod de dos capas, base de datos y backend, en los mismos nodos.

Por ejemplo, supongamos que:

* Deseamos que los Pod **example-js-affi** y **redis** esten desplegados juntos siempre que sea posible (preferred)
* No queremos que dos Pod **redis** esten corriendos juntos en un mismo host (nodo).

**Spec** de **redis**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
        role: db
    spec:
      containers:
        - image: redis:latest
          imagePullPolicy: Always
          name: redis
          ports:
          - containerPort: 6379
            protocol: TCP
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: role
                operator: In
                values:
                - db
            topologyKey: "kubernetes.io/hostname"
        podAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                  - key: role
                    operator: In
                    values:
                    - example
              topologyKey: kubernetes.io/hostname
```

### Taints and tolerations

**Taints** se utiliza para marcar nodos con "desafios" o "marcas" que los pods deben *soportar* (**tolerations**) antes de poder ser asignados a ese nodo durante su **Scheduling**.

Asignamos la marca "designation=highperf" al nodo2. Los Pods que no soporten esa marcan no podran ser ejecutados en ese nodo.

```
kubectl taint node node1 perf=alto:NoExecute
kubectl taint node node2 perf=medio:NoExecute
kubectl taint node node3 perf=bajo:NoExecute
kubectl describe node node1
```

Para permitir que un Pod se asigne a los nodos con esa marca la capacidad de soportar ese desfio en la definición del Spec.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: app
      image: nginx:latest
      ports:
        - containerPort: 80
          protocol: TCP
  tolerations:
    - key: "perf"
      operator: "Equal"
      value: "medio"
      effect: "NoExecute"
```

El desafio debe hacer **match** completo a la marca.

Para eliminar una **marca** ejecutamos:
```
kubectl taint node node2 perf:NoExecute-
```