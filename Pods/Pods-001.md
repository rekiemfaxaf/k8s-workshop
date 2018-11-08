# Pods

Un **Pod** es el componente fundamental de Kubernetes sobre el cual opera su **Scheduler**.

Un Pod esta compuesto por:

  * 1 o más contenedores.
  * 1 interfaz de red con dirección IP compartida por todos los contenedores.
  * Volumenes compartidos por todos los contenedores.
  * Variables de entorno exclusivas para cada contenedor.
  * 1 o más contenedores Iniciales (**Init Containers**).
  * Reglas de Afiniad.

Ademas para cada contenedor se pueden definir:
* **livenesProbe**: Para determinar cuando el contenedor esta corriendo.
* **readinessProbe**: Para determinar cuando puede recibir tráfico.

## Spec

Cada entidad en kubernetes esta definida por un [Spec]( https://kubernetes.io/docs/user-guide/pods/multi-container/).
En el caso de un Pod, y similar a la mayoria de los recursos en Kubernetes, el spec sigue la siguiente logica:

* **a**piVersion: v1
* **k**ind: Pod
* **m**etadata: Nombre, namepace, labels y anotations.
* **s**pec: Parametros de configuración. En este caso lista de contenedores.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
    role: web
    version: v1
spec:
  containers:
    - name: app
      image: nginx:latest
      ports:
        - containerPort: 80
          protocol: TCP
```

[Api Reference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.10/#pod-v1-core)

## Operación

kubectl:
```
kubectl apply pod.spec.yaml
kubectl po -o wide
kubectl get pod nginx
```

Información detalla (troubleshooting):
```
kubectl describe pods nginx
```

Operar el pod en ejecución

```
kubectl exec -ti nginx bash
kubectl logs nginx
```

## Port forwarding

Permite redirirección puerto de un Pod a directamente en el laptop.
```
kubectl port-forward nginx 8000:80
````

## TroubleShooting

Exportar el objeto Pod en formato **YAML** permite examinar el cambio **Status** en donde se detallan razones por las cuales podría fallar un despliegue: imágenes mal escritas, problemas de red, secretos no existentes, etc.

```
kubectl get pod nginx -o yaml
kubectl edit pod nginx
```