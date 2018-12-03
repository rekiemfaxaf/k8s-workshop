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
  name: nodejs-example
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
```

[Api Reference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.10/#pod-v1-core)

## Operación

kubectl:
```
kubectl apply -f pod.spec.yaml
kubectl get po -o wide
kubectl get pod nodejs-example
```

Información detalla (troubleshooting):
```
kubectl describe pods nodejs-example
```

Operar el pod en ejecución

```
kubectl exec -ti nodejs-example bash
kubectl logs nodejs-example
```

## Port forwarding

Permite redirirección puerto de un Pod a directamente en el laptop.
```
kubectl port-forward nodejs-example 3000:3000
````

## TroubleShooting

Exportar el objeto Pod en formato **YAML** permite examinar el cambio **Status** en donde se detallan razones por las cuales podría fallar un despliegue: imágenes mal escritas, problemas de red, secretos no existentes, etc.

```
kubectl get pod nodejs-example -o yaml
kubectl edit pod nodejs-example
```

## Variables de entorno

Las sección `env` del **spec** se utiliza para definir variables las cuales pueden ser definidas
en el mismo `yaml` o referenciando `ConfigMaps`,`Secrets` u otros
[campos](https://kubernetes.io/docs/tasks/inject-data-application/environment-variable-expose-pod-information/) del yaml.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nodejs-example
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
```