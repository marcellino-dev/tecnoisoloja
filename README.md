#  Tecnoiso Shop - Arquitetura de E-commerce

##  Sobre o projeto

Sistema de e-commerce desenvolvido com foco em **arquitetura escalável baseada em microsserviços**, simulando um ambiente real de produção com autenticação segura, integração com pagamentos e separação de responsabilidades.

##  Arquitetura do sistema


O sistema foi projetado seguindo conceitos modernos de engenharia de software:

* API Gateway como ponto central de entrada
* Microsserviços independentes
* Comunicação via APIs REST
* Integração com serviços externos (Mercado Pago)
* Uso de Webhooks para eventos de pagamento

---

##  Stack utilizada

###  Frontend

* Next.js
* TypeScript

###  Backend

* Supabase (Banco de dados)
* APIs REST
* JWT / OAuth

###  Infraestrutura

* API Gateway
* Rate Limiting
* Logging
* SSL
* Kubernetes (conceitual)

---

##  Microsserviços

O sistema é dividido em serviços independentes:

###  Auth Service

* Autenticação de usuários
* Emissão de tokens JWT

###  Product Service

* Gerenciamento de produtos

###  Cart Service

* Manipulação de carrinho
* Adição/remoção de itens

###  Order Service

* Criação e consulta de pedidos

###  Payment Service

* Integração com Mercado Pago
* Processamento via webhook

---

##  Fluxo da aplicação

1. Usuário acessa o frontend
2. Requisições passam pelo API Gateway
3. Gateway distribui para os microsserviços
4. Pagamentos são processados via Mercado Pago
5. Webhooks atualizam status dos pedidos

---

##  Segurança

* Autenticação com JWT
* OAuth (conceitual)
* SSL
* Rate Limiting
* Proteção contra fraude

---

##  Diferenciais do projeto

* Arquitetura baseada em microsserviços
* Separação clara de responsabilidades
* Integração com sistema de pagamento real
* Pensado para escalabilidade
* Simulação de ambiente produtivo

---

##  Status do projeto

 Em desenvolvimento

---

##  Autor

Marcelino Souza
