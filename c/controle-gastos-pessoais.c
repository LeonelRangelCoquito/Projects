/*
1- Perguntar quanto dinheiro a pessoa tem
2- Perguntar o valor de cada gasto
3- Subtrair cada gasto do dinheir disponivel
4- permitir registrar novos gastos
5- mostrar quanto gastou e quanto sobrou
*/

#include <stdio.h>

int main(){
    float saldo = 0;
    float despesas = 0;
    int menu = 0;

    printf("Olá, bem-vindo ao controle de gastos xD\nPor favor informe seu saldo: \n");
    scanf("%f",saldo);

    printf("O que deseja fazer?\n");
    
    do{
        printf("1: registrar nova despesa\n");
        printf("2: sair... \n");
        scanf("%d",menu);
    }
        while(menu != 2);

    switch (menu){
        case 1:
        float tmp = 0;
        printf("Digite o valor da despesa: \n");
        scanf("%f",tmp);
        despesas += tmp;


    }
}