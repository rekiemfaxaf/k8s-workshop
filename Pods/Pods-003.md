# Pod Resource

Es posible definir los recursos minimos y máximos de un Pod. Esta información será utilizada por el **Scheduler** para elegir en que nodo ejecutar el Pod.

* requests: Corresponde a los recursos minimos para poder ser ejecutado.
* limits: Corresponde a los recursos máximos que puede llegar a utilizar.

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
  resources:
    requests:
      memory: "128Mi"
      cpu: "250m"
    limits:
      memory: "256Mi"
      cpu: "500m"
```

**500m** corresponde a 500 milicpu, es decir, 1000m corresponde a 1 cpu completa.