# Pod Resource

Es posible definir los recursos minimos y máximos de un Pod. Esta información será utilizada por el **Scheduler** para elegir en que nodo ejecutar el Pod.

* requests: Corresponde a los recursos minimos para poder ser ejecutado.
* limits: Corresponde a los recursos máximos que puede llegar a utilizar.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nodejs-example-resources
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
      resources:
        requests:
          memory: "128Mi"
          cpu: "250m"
        limits:
          memory: "256Mi"
          cpu: "500m"
```

**500m** corresponde a 500 milicpu, es decir, 1000m corresponde a 1 cpu completa.