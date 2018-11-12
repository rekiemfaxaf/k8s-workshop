# ConfigMap y Secret


**ConfigMap** y **Secret** son objetos estructuralmente iguales que se utilizan para almacenar información. 

**Secret** guarda el valor de llaves en `base64` y es almacenado en `etcd` utilizando la llave Simetrica AES configurada en el los nodos Maestros de Kubernetes.

Ambos objetos pueden ser utilizados dentro del Pod como variable de entorno o archivo:

## Como variabe de entorno

El **Spec** de ConfigMap y Secret son muy parecidos y tienen la siguiente forma: 

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cm
data:
  HEALTH_STATUS: "200"
  PORT: "3000"
```

Dentro de un Pod pueden ser utilizados de la siguiente manera:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nodejs-cm
  namespace: default
  labels:
    app: nodejs
    role: example
    version: v1
spec:
  containers:
    - name: app
      image: semoac/nodejs-example:latest
      ports:
        - containerPort: 3000
          protocol: TCP
      env:
        - name: PORT
          valueFrom:
            configMapKeyRef:
                name: cm
                key: PORT
        - name: HEALTH_STATUS
          valueFrom:
            configMapKeyRef:
                name: cm
                key: HEALTH_STATUS
        - name: NS
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
```

## Como volumen

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: nodejs-cm2
    namespace: default
    labels:
        app: nodejs
        role: example
        version: v1
spec:
    containers:
        - name: app
          image: semoac/nodejs-example:latest
          volumeMounts:
            - name: config
              subPath: PORT
              mountPath: /etc/port.conf
            - name: config
              mountPath: /config
          ports:
            - containerPort: 3000
              protocol: TCP
          envFrom:
            - configMapRef:
                  name: cm
          env:
            - name: NS
              valueFrom:
                fieldRef:
                    fieldPath: metadata.namespace
    volumes:
        - name: config
          configMap:
            name: cm
```