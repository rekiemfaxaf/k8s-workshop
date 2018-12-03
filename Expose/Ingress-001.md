# Ingress

Los objetos ```Ìngress``` permiten exponer aplicaciones utilizando reglas de Layer 7.

Kubernetes no provee un controlador por omisión por lo que se debe instalar alguno.

Entre los mas utilizados, y mantenidos oficialmente por Kubernetes, se encuentra ```Nginx Ingress Controller``` que puede ser facilemente instalado utilizando ```Helm```


```bash
smorales@cloudshell:~ (k8s-sandbox-sistemas)$ helm repo update
Hang tight while we grab the latest from your chart repositories...
...Skip local chart repository
...Successfully got an update from the "stable" chart repository
Update Complete. ⎈ Happy Helming!⎈

smorales@cloudshell:~ (k8s-sandbox-sistemas)$ helm search nginx
NAME                            CHART VERSION   APP VERSION     DESCRIPTION                                           
      
stable/nginx-ingress            0.31.0          0.20.0          An nginx Ingress controller that uses ConfigMap to sto
re ...
stable/nginx-ldapauth-proxy     0.1.2           1.13.5          nginx proxy with ldapauth                             
      
stable/nginx-lego               0.3.1                           Chart for nginx-ingress-controller and kube-lego      
      
stable/gcloud-endpoints         0.1.2           1               DEPRECATED Develop, deploy, protect and monitor your A
PIs...

smorales@cloudshell:~ (k8s-sandbox-sistemas)$ helm install --namespace=nginx-ingress --name=nginx-ingress stable/nginx
-ingress
NAME:   nginx-ingress
NAMESPACE: nginx-ingress
STATUS: DEPLOYED
RESOURCES:
==> v1beta1/ClusterRole
NAME           AGE
nginx-ingress  1s
==> v1beta1/ClusterRoleBinding
nginx-ingress  0s
==> v1beta1/RoleBinding
nginx-ingress  0s
==> v1/ConfigMap
nginx-ingress-controller  1s
==> v1/ServiceAccount
nginx-ingress  1s

==> v1beta1/Deployment
nginx-ingress-controller       0s
nginx-ingress-default-backend  0s

==> v1/Pod(related)

NAME                                            READY  STATUS             RESTARTS  AGE
nginx-ingress-controller-cb949c9c5-5x68n        0/1    ContainerCreating  0         0s
nginx-ingress-default-backend-5455568d9d-tlbm7  0/1    ContainerCreating  0         0s

==> v1beta1/Role

NAME           AGE
nginx-ingress  0s

==> v1/Service
nginx-ingress-controller       0s
nginx-ingress-default-backend  0s


NOTES:
The nginx-ingress controller has been installed.
It may take a few minutes for the LoadBalancer IP to be available.
You can watch the status by running 'kubectl --namespace nginx-ingress get services -o wide -w nginx-ingress-controller'

An example Ingress that makes use of the controller:

  apiVersion: extensions/v1beta1
  kind: Ingress
  metadata:
    annotations:
      kubernetes.io/ingress.class: nginx
    name: example
    namespace: foo
  spec:
    rules:
      - host: www.example.com
        http:
          paths:
            - backend:
                serviceName: exampleService
                servicePort: 80
              path: /
    # This section is only required if TLS is to be enabled for the Ingress
    tls:
        - hosts:
            - www.example.com
          secretName: example-tls

If TLS is enabled for the Ingress, a Secret containing the certificate and key must also be provided:

  apiVersion: v1
  kind: Secret
  metadata:
    name: example-tls
    namespace: foo
  data:
    tls.crt: <base64 encoded cert>
    tls.key: <base64 encoded key>
```

Tipicamente un Ingress Controller es deplegado como un ```Deployment``` o un ```DeamonSet``` y es publicado utilizando
un servicio del tipo ```LoadBalancer```.

```
smorales@cloudshell:~ (k8s-sandbox-sistemas)$ kubectl -n nginx-ingress get svc
NAME                            TYPE           CLUSTER-IP      EXTERNAL-IP    PORT(S)                      AGE
nginx-ingress-controller        LoadBalancer   10.11.249.248   35.194.4.190   80:30891/TCP,443:31957/TCP   2m
nginx-ingress-default-backend   ClusterIP      10.11.244.255   <none>         80/TCP                       2m
smorales@cloudshell:~ (k8s-sandbox-sistemas)$ 
```

## Spec


Desplegar [ejemplo](../Deploy/Deployment-001.md) y exponer en modo ```ClusterIP```:

```
kubectl expose deployment nodejs-example --port=3000 --type=ClusterIP
```



```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nodejs-example
  annotations:
    kubernetes.io/ingress.class: "nginx"
spec:
  rules:
  - host: nodejs-example.cocha.com
    http:
      paths:
      - backend:
            serviceName: nodejs-example
            servicePort: 3000
```

Confirmar regla:

```bash
smorales@cloudshell:~ (k8s-sandbox-sistemas)$ curl -i 35.194.4.190
default backend - 404

smorales@cloudshell:~ (k8s-sandbox-sistemas)$ curl -i 35.194.4.190 -H "Host: nodejs-example.cocha.com"
Kubernets Workshop from host <strong>nodejs-example-86ddb4cff-jjbtp</strong> in namespace: <strong>default</strong>.

```

Tambien es posible crear mapeo de rutas a servicios:

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nodejs-example2
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: nodejs-example2.cocha.com
    http:
      paths:
      - path: /workshop 
        backend:
            serviceName: nodejs-example
            servicePort: 3000
```

````bash
$ curl 35.194.4.190/workshop -H "Host: nodejs-example2.cocha.com"
Kubernets Workshop from host <strong>nodejs-example-86ddb4cff-9hdb2</strong> in namespace: <strong>default</strong>.
$ curl 35.194.4.190 -H "Host: nodejs-example2.cocha.com"
default backend - 404
```