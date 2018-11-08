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
  nodeSelector:
    tier: 'dev'
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

Por ejemplo: *Lanzar el pod en un nodo que no tengas las API de Kubernetes y que posea cualquier label del tipo "tier".*

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
          protocol: 
  affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: node-role.kubernetes.io/master
                operator: DoesNotExist
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 1
              preference:
                matchExpressions:
                - key: tier
```
```node-role.kubernetes.io/master``` es un label que es agregado automáticamente a nodos  que hospedan la APIs de Kubernetes.


### podAffinity

Este tipo de afinidad permite agrupar pods en los nodos. Esto es util cuando queremos, por ejemplo, agrupar Pod de dos capas, base de datos y backend, en los mismos nodos.

Por ejemplo, supongamos que:

* Deseamos que los Pod **nginx** y **redis** esten desplegados juntos siempre que sea posible (preferred)
* No queremos que dos Pod **redis** esten corriendos juntos en un mismo host (nodo).

**Spec** de **nginx**:


```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  role: web
spec:
  containers:
    - name: app
      image: nginx:latest
      ports:
        - containerPort: 80
          protocol: TCP
  affinity:
    podAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: role
                  operator: In
                  values:
                  - db
              topologyKey: kubernetes.io/hostname
        
```

**Spec** de **redis**:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: redis
  role: db
spec:
    containers:
      - image: redis:latest
        imagePullPolicy: Always
        name: redis
        ports:
        - containerPort: 6379
          protocol: TCP
      restartPolicy: Always
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
```

### Taints and tolerations

**Taints** se utiliza para marcar nodos con "desafios" o "marcas" que los pods deben *soportar* (**tolerations**) antes de poder ser asignados a ese nodo durante su **Scheduling**.

Asignamos la marca "designation=highperf" al nodo2. Los Pods que no soporten esa marcan no podran ser ejecutados en ese nodo.

```
kubectl taint node node2 designation=highperf:NoExecute
```

Para permitir que un Pod se asigne a los nodos con esa marca la capacidad de soportar ese desfio en la definición del Spec.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  role: web
spec:
  containers:
    - name: app
      image: nginx:latest
      ports:
        - containerPort: 80
          protocol: TCP
  tolerations:
    - key: "designation"
      operator: "Equal"
      value: "highperf"
      effect: "NoExecute"
```

El desafio debe hacer **match** completo a la marca.

Para eliminar una **marca** ejecutamos:
```
kubectl taint node node2 designation:NoExecute-
```