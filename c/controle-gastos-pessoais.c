/*
1- Perguntar quanto dinheiro a pessoa tem
2- Perguntar o valor de cada gasto
3- Subtrair cada gasto do dinheiro disponivel
4- permitir registrar novos gastos
5- mostrar quanto gastou e quanto sobrou
*/

#include <stdio.h>
#include <stdlib.h>

int main(){
    float saldo = 0;
    float despesas = 0;
    float temp = 0;
    int menu = 0;


    printf("Olá, bem-vindo ao controle de gastos xD\nPor favor informe seu saldo: \n");
    scanf("%f",&saldo);

    
    
    do{
        system("clear");
        printf("<----O que deseja fazer?---->\n");
        printf("1: registrar nova despesa\n");
        printf("2: sair... \n");
        scanf("%d",&menu);
        if (menu == 1){
            printf("digite o valor da despesa: \n");
            scanf("%f",&temp);
            if (temp < saldo){
                despesas += temp;
            }
            else {
                printf("Saldo insuficiente.\n Saldo atual : %.2f\n",saldo);
                system("clear");
            }
        }
    }
        while(menu != 2);
    system("clear");// limpa o console.
    printf("Saldo inicial: %.2f\n",saldo);
    printf("Total de despesas: %.2f\n",despesas);
    saldo -= despesas;

    printf("Saldo atual: %.2f\n",saldo);

    


    return 0;
}