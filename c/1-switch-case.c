#include <stdio.h>

int main(){
    int escolha;
    
    printf("Escolha seu produto:\n1 água\n2 refrigerante\n3 suco\n: ");
    scanf("%d",&escolha);

    switch (escolha){
        case 1:
        printf("Você escolheu água.\n");
        break;

        case 2:
        printf("Você escolheu refrigerante.\n");
        break;

        case 3:
        printf("Você escolheu suco.\n");
        break;

        default:
        printf("Opção digitada é inválida.\n");
    }
    printf("fim.\n");
    return 0;
}