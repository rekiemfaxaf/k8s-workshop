# Service

Service es un objetvo básico de Kubernetes que permite exponer una aplicación en Layer 4.
Existen varios tipos:

* ClusterIP: Vía DNS permitiendo Service Discovery.
* ExternalIP: Especificando las IP publicas de los nodos de computo donde queremos publicar el puerto TCP.
* NodePort: Especificando el puerto que queremos publicar en los nodos de computo.
* LoadBalancer: Disponible solo en Cloud o con soluciones de terceros. Es la Cloud (AWS, Azure, Google, Openstack) quien crear un balanceador de carga en una red publica.


Similar a un **Deployment**, Service utiliza **selectores** basados en **labels** para determinar  a que Pods se debe enviar el tráfico. Solo Pods en estado **ready** recibiran trafico.

## Operación.


Desplegar [ejemplo](../Deploy/Deployment-001.md)

```
kubectl get svc
kubectl get deploy
kubectl expose deploy nodejs-example --type=LoadBalancer --port=80 --target-port=3000
```

## Service Discovery

```bash
kubectl run -ti --restart=Never --rm --image=busybox busybox -- sh
smorales@cloudshell:~ (k8s-sandbox-sistemas)$ kubectl run -ti --restart=Never --rm  --image=alpine busybox -- sh
/ # apk add curl
fetch http://dl-cdn.alpinelinux.org/alpine/v3.8/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.8/community/x86_64/APKINDEX.tar.gz
(1/5) Installing ca-certificates (20171114-r3)
(2/5) Installing nghttp2-libs (1.32.0-r0)
(3/5) Installing libssh2 (1.8.0-r3)
(4/5) Installing libcurl (7.61.1-r1)
(5/5) Installing curl (7.61.1-r1)
Executing busybox-1.28.4-r1.trigger
Executing ca-certificates-20171114-r3.trigger
OK: 6 MiB in 18 packages
/ # curl nodejs-example
Kubernets Workshop from host <strong>nodejs-example-86ddb4cff-56rps</strong> in namespace: <strong>default</strong>.
/ # env | grep -i node
NODEJS_EXAMPLE_SERVICE_HOST=10.11.243.72
NODEJS_EXAMPLE_SERVICE_PORT=80
NODEJS_EXAMPLE_PORT=tcp://10.11.243.72:80
NODEJS_EXAMPLE_PORT_80_TCP_ADDR=10.11.243.72
NODEJS_EXAMPLE_PORT_80_TCP_PORT=80
NODEJS_EXAMPLE_PORT_80_TCP_PROTO=tcp
NODEJS_EXAMPLE_PORT_80_TCP=tcp://10.11.243.72:80
/ # 
```

## Spec

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: nodejs
    role: example
    version: v1
  name: nodejs-example
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 3000
  selector:
    app: nodejs
  type: LoadBalancer
```

Para cada uno de los distintos tipo tenemos:

**ClusterIP**:
```yaml
apiVersion: v1
kind: Service
metadata:
    name: nodejs-example
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 3000
  selector:
    app: nodejs
  type: ClusterIP
```

**NodePort**:
```yaml
apiVersion: v1
kind: Service
metadata:
    name: nodejs-example
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 3000
    NodePort: 8080
  selector:
    app: nodejs
  type: NodePort
```

**ExternalIP**:
```yaml
apiVersion: v1
kind: Service
metadata:
    name: nodejs-example
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 3000
  selector:
    app: nodejs
  type: NodePort
  externalIPs:
  - 192.168.1.1
  - 192.168.1.2
```

## Headless Service

La contraparte del objetco Service son los **Endpoints**:

```bash
smorales@cloudshell:~ (k8s-sandbox-sistemas)$ kubectl get svc,endpoints
NAME                     TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)        AGE
service/kubernetes       ClusterIP      10.11.240.1    <none>          443/TCP        5h
service/nodejs-example   LoadBalancer   10.11.243.72   35.224.141.34   80:32293/TCP   20m
NAME                       ENDPOINTS                                                  AGE
endpoints/kubernetes       35.188.221.219:443                                         5h
endpoints/nodejs-example   10.8.0.24:3000,10.8.0.25:3000,10.8.0.26:3000 + 2 more...   20m
```


Cuando ```spec.selector``` es definido, Kubernetes Controller se encargada de mantener al día el Endpoint de un Service.

En caso contrario, Endpoint deberá ser creado y mantenido a manualmente. Esto se conoce como **Headless Service**.

El siguiente ejemplo crear un Headless Service que apunta a un servidor Telnet externo:

```yaml
apiVersion: v1
kind: Service
metadata:
    name: sw
spec:
  ports:
  - port: 23
    protocol: TCP
    targetPort: 23
  clusterIP: None

---

apiVersion: v1
kind: Endpoints
metadata:
 name: sw
subsets:
 - addresses:
     - ip: 94.142.241.111
   ports:
     - port: 23

```

```bash
kubectl run -ti --restart=Never --rm  --image=alpine busybox -- sh
apk add socat
socat - TCP:sw:23
```