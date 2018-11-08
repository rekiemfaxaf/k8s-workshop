# Pod Probes

Por cada contenedor en un Pod es posible definir **livenesProbe** y **readinessProbe**.

**livenesProbe** verifica el estado del Pod. En caso que falle el Pod es sujeto a la politica de reinicio.

**readinessProbe** permite definir cuando el Pod esta listo para recibir tráfico, por ejemplo luego de calentar cache o registrarse exitosamente con un endpoint. Sólo una vez que este test es exitoso el Pod se agrega al **Endpoint** de un **Service**.


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
      livenessProbe:
        tcpSocket:
           port: 80
        initialDelaySeconds: 5
        periodSeconds: 5
      readinessProbe:
        httpGet:
          path: /
          port: 8079
        initialDelaySeconds: 5
        periodSeconds: 3
```