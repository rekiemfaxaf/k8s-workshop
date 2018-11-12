# Pod Probes

Por cada contenedor en un Pod es posible definir **livenesProbe** y **readinessProbe**.

**livenesProbe** verifica el estado del Pod. En caso que falle el Pod es sujeto a la politica de reinicio.

**readinessProbe** permite definir cuando el Pod esta listo para recibir tráfico, por ejemplo luego de calentar cache o registrarse exitosamente con un endpoint. Sólo una vez que este test es exitoso el Pod se agrega al **Endpoint** de un **Service**.


```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nodejs-example-probe
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
          value: "3000"
        - name: NS
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: HEALTH_STATUS
          value: "500"
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