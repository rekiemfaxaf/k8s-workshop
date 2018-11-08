## ConfigMap y Secret


**ConfigMap** y **Secret** son objetos estructuralmente iguales que se utilizan para almacenar información. 

**Secret** guarda el valor de llaves en `base64` y es almacenado en `etc` utilizando la llave Simetrica AES configurada en el los nodos Maestros de Kubernetes.

Ambos objetos pueden ser utilizandos 