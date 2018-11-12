# Helm Package Manager

## Instalación

```bash
curl https://raw.githubusercontent.com/kubernetes/helm/master/scripts/get > get_helm.sh
chmod 700 get_helm.sh
./get_helm.sh
```

Debido a que desde Kubernetes 1.8 RBAC viene activado por omisión, debemos crear un ```service account``` con privilegios
suficiente para crear los recursos.

```bash
kubectl create -n kube-system sa tiller
kubectl create clusterrolebinding tiller-admin --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
````

Tiller, es el componente que actua como "servidor" y debe ser instalado dentro del cluster:

```
helm init --service-account=tiller
helm version
```