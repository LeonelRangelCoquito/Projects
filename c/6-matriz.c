#include <stdio.h>

int main(){
    int matriz[4][5];
    for (int m = 0; m < 4; m++){
        for (int n = 0; n < 5; n++){// ele processa e imprime uma linha por vez;
            matriz[m][n]= (m+1)*(n+1);
            printf("%d ",matriz[m][n]);
        }
        printf("\n");
    }

    return 0;
}