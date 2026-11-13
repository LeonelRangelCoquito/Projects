# include <stdio.h>

int main(){
    float contador = 0;
    while (contador < 1)
    {
        printf("Número : %f\n",contador);
        contador += 0.00001;
    }
    return 0;
    
}