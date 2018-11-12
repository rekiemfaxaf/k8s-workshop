# Developments

Este tipo de objeto agrega logicas robustas a *ReplicaSet* gestionando rollouts y rollbacks de despliegues,
asegurando consistencia en el estado de los pods.

[INSERT IMAGE]

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-example
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
      app: nodejs
  template:
    metadata:
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
