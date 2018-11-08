# Developments

Este tipo de objeto agrega logicas robustas a *ReplicaSet* gestionando rollouts y rollbacks de despliegues.

[INSERT IMAGE]

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  revisionHistoryLimit: 4
  replicas: 8
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
    spec:
      containers:
        - name: app
          image: nginx:latest
          ports:
            - containerPort: 80
              protocol: TCP
```

## Operacion

Revisar estado del despliegue
```
kubectl rollout status deployment/nginx
```

Expandir/cotraer despligue
```
kubectl scale deployment/nginx --replicas=12
kubectl rollout status deployment/nginx
```

Revisar historial de despliegues
```
kubectl rollout history deploy/nginx
kubectl rollout history deploy/nginx --revision=xx
```

Rollback
```
kubectl rollout history deploy/nginx
kubectl rollout undo deploy/nginx --to-revision=3
```
