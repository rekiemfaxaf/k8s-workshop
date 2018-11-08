# ReplicaSets

**ReplicaSets** es un objeto básico de Kubernetes que permite dar **Hig Availavility** a **Pods**.

[INSERT IMAGEN]

Su **spec** contiene un plantilla del *spec de un pod*.

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx
spec:
  replicas: 5
  minReadySeconds: 20
  selector:
    matchLabels:
      tier: web
  template:
    metadata:
      name: nginx
      labels:
        app: nginx
        tier: web
        version: v1
    spec:
      containers:
        - name: app
          image: nginx:latest
          ports:
            - containerPort: 80
              protocol: TCP
```

En este caso `spec.selector.matchLabels` indica la lista de label que **ReplicaSet** vigilará.

**ReplicaSet** se preocupará que existan creados **5** con el label `tier:web` a lo largo de todo el **namespace** independiente si el Pod fue creado por él o no.

`spec.template.metadata.labels` estable con los labels con que se crearán los nuevos Pods. Esto debe coincider con el `selector` definido en `spec.selector`.