# Multicontainers

Dentro de la sección **Spec** de un Pod es posible definir multiples contenedores.

Estos contenedores compartiran:
* Intafaces de red (lo que incluye reglas iptables).
* Hostname.
* Volumenes.
* Nodo de computo.

No compartiran:
* Logs.
* Sistema de archivos.
* Probes o Healthchecks.

**InitContainer** corresponde a un contenedor que se ejecutara antes primero que el resto y detendra el
despliegue del resto de los contenedores hasta que finalice su ejecución. 

Normalmente se utilizan para preparar el ambiente (ej. volumenes) para el resto de los contenedores.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-example-multi
  namespace: default
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  revisionHistoryLimit: 4
  replicas: 5
  minReadySeconds: 20
  selector:
    matchLabels:
      app: nodejs-multi
  template:
    metadata:
      labels:
        app: nodejs-multi
        role: example
        version: v1
    spec:
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