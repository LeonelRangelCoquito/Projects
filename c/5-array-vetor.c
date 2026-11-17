#include <stdio.h>

int main(){
    int numeros[10];// Criação de um array/vetor com 10 posições.
    for (int i = 0; i < 10; i++){ // este for ira atribuir a cada posição do vetor um numero 
        numeros[i] = i;           // começando em 0 e terminando em 9
        printf("Número : %d\n",numeros[i]);

    }
    return 0;
}