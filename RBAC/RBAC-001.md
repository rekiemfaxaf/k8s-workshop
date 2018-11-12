#  Authentication and Authorization 

RBAC es utilizado por omisión desde Kubernetes 1.8 y se utiliza para limitar el acceso a los recursos del Cluster.

Como la interacción con Kubernetes ocurre a traves de una API REST, RBAC utiliza ```verbs``` para listar acciones,
```resources``` para identificar los objetos pertenecientes a ```apiGroups```.

Los actores que reciben estos permisos pueden ser ```usuarios``` o ```service accounts```.

**Importante:** Kubernetes no provee una API para gestionar usuarios. La responsabilidad de esta gestion es delegada a servicios externos integrados utilizando OpenID u otros mecanismos similares.

Debido a lo anterior es que se utilizan ```servicesaccounts``` para crear cedenciales de acceso. 

Los ```service account``` se crean dentro de ```namespace```.

## Service Account

| ServiceAccount | NameSpace | Recursos | Verbos |
|----------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| ops | all | all | all |
| dev | default | deployments, statefulsets, services, pods, configmaps, secrets,,replicasets, ingresses, endpoints, cronjobs, jobs,persistentvolumeclaims | get, list , watch, update, patch, create |
| audit | default | all | get, list, watch |

### Creación de service account

```bash
kubectl create sa ops
kubectl create sa dev
kubectl create sa audit
```

### Obteción de tokets

```bash
kubectl get secret $(kubectl get sa ops -o jsonpath='{.secrets[0].name}') -o jsonpath='{.data.token}' | base64 -d
kubectl get secret $(kubectl get sa dev -o jsonpath='{.secrets[0].name}') -o jsonpath='{.data.token}' | base64 -d
kubectl get secret $(kubectl get sa audit -o jsonpath='{.secrets[0].name}') -o jsonpath='{.data.token}' | base64 -d
```

### Configuración de credenciales con kubectl

```
kubectl config set-cluster workshop --insecure-skip-tls-verify=true --server=https://IP
kubectl config set-credentials ops --token=<token>
kubectl config set-context workshop-context --cluster=workshop --user=ops --namespace=default
kubectl config use-context workshop-context
```

## Role y ClusterRole

Las definiciones de RBAC se conocen como ```Role``` (para un solo namespace) y ```ClusterRole``` (para todos los namespaces del cluster).

Por omisión ya existe el cluster role ```cluster-admin``` para ```ops``` por lo que solo crearemos los 2 Roles faltantes (**check your privileges**) :

```
kubectl create role audit-role --resource=deployments,statefulsets,services,pods,configmaps,secrets,replicasets,ingresses,endpoints,cronjobs,jobs,persistentvolumeclaims --verb=get,list,watch
kubectl create role dev-role --resource=deployments.apps,statefulsets,services,pods,configmaps,secrets,replicasets,ingresses,endpoints,cronjobs,jobs,persistentvolumeclaims,pods/exec --verb=get,list,watch,update,patch,create

kubectl get role
```

```deployments.apps``` explicitamente se refiere al recurso ```deployments``` en el apiGroup: ```apps```.
```pods/exec``` es un recurso especial que controla el acceso a llamadas ```exec``` de la API.


### RoleBinding y ClusterRoleBinding

```Role``` y ```ClusterRole``` son asociados a uno o varios usuarios a traves un ```RoleBinding``` y ```ClusterRoleBinding``` respectivamente.

```bash
kubectl create rolebinding dev-binding --serviceaccount=default:dev --role=dev-role
kubectl create rolebinding audit-binding --serviceaccount=default:audit --role=audit-role
kubectl create clusterrolebinding ops-binding --serviceaccount=default:ops --clusterrole=cluster-admin
kubectl get rolebinding
kubectl get clusterrolebinding
```

## Role en Pods

Cada vez que se crea un ```namespace``` se crea tambien un ```serviceaccount``` llamado ```default``` dentro de ese namespace. Este serviceaccount no esta asociado a ningun rol y es utilizado por omisión para ser montado dentro de cada pod.

Herramientas como ```kubectl``` y bibliotecas de lenguajes como ```Go``` o ```Python``` leerán estan credenciales de forma automatica.

Crearemos 3 pods asociados a cada una de las service accounts.

```
kubectl run dev --serviceaccount=dev --image=google/cloud-sdk -- sleep infinity
kubectl run ops --serviceaccount=ops --image=google/cloud-sdk -- sleep infinity
kubectl run audit --serviceaccount=audit --image=google/cloud-sdk -- sleep infinity
```

En este caso ```dev``` podra crear pods pero ```audit``` podra solo listarlos.

```bash
kubectl exec audit-65f6d65fdc-x8gmg -- kubectl run from-inside --image=nginx
Error from server (Forbidden): deployments.apps is forbidden: User "system:serviceaccount:default:audit" cannot create
 deployments.apps in the namespace "default"
command terminated with exit code 1

kubectl exec dev-64f95f49ff-t724c -- kubectl run from-inside --image=nginx
deployment.apps/from-inside created

kubectl get pods
```
