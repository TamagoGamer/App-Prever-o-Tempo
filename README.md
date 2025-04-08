# Projeto Clima Atual - React Native

Este é um projeto de aplicativo móvel desenvolvido com **React Native** que fornece a previsão do tempo atual para uma cidade específica. O aplicativo utiliza APIs externas para obter dados de clima e coordenadas geográficas, além de permitir que os usuários busquem informações sobre o clima de várias cidades.

## Funcionalidades

- **Tela de Clima Atual**: Permite que os usuários insiram o nome de uma cidade e vejam a temperatura atual para essa cidade.
- **Tela de Previsão**: Exibe a previsão do tempo para a cidade selecionada.
- **Cidades Favoritas**: Os usuários podem salvar suas cidades favoritas para consultar rapidamente o clima.
- **Modo Claro e Escuro**: A interface do usuário se adapta automaticamente ao tema do sistema (claro ou escuro).
- **Armazenamento Persistente**: O aplicativo utiliza o `AsyncStorage` para salvar a cidade favorita do usuário e exibi-la sempre que o aplicativo for reaberto.

## Tecnologias Usadas

- **React Native**: Framework para desenvolvimento de aplicativos móveis multiplataforma.
- **Axios**: Biblioteca para fazer requisições HTTP e buscar dados das APIs.
- **AsyncStorage**: Utilizado para armazenar dados localmente no dispositivo, como a cidade favorita.
- **React Navigation**: Usado para implementar navegação entre telas, como Tab Navigator.
- **Open Meteo API**: API utilizada para buscar os dados de clima atual e previsão do tempo.

## Instalação

1. Clone ou baixe o repositório:
   ```bash
   git clone <URL-do-repositório>

2. Navegue até a pasta do projeto:
    ```bash
    cd nome-do-projeto

## Como Funciona

### Buscar Clima:
O usuário pode digitar o nome de uma cidade na caixa de texto e clicar em "Buscar Clima" para ver a temperatura atual da cidade. O aplicativo faz uma requisição para o serviço de geocodificação (Open Meteo) para obter as coordenadas da cidade e, em seguida, faz uma requisição para obter os dados climáticos.

### Armazenamento de Cidade Favorita:
A cidade inserida pode ser salva como favorita utilizando o AsyncStorage. Quando o aplicativo for reaberto, ele irá recuperar a cidade favorita e exibir o clima correspondente.

### Modo Claro e Escuro:
O aplicativo ajusta automaticamente o tema da interface com base nas configurações do sistema do dispositivo (modo claro ou escuro).

## Estrutura do Projeto

- **src/components**: Contém componentes reutilizáveis como ThemedText e ThemedView.
- **src/screens**: Contém as telas do aplicativo, incluindo TabOneScreen (Clima Atual) e TabTwoScreen (Previsão).
- **src/api**: Contém funções para interagir com as APIs externas (geocodificação e clima).

## Melhorias Futuras

- Adicionar animações usando react-native-reanimated para melhorar a experiência do usuário.
- Utilizar context para gerenciar o estado da aplicação e tornar o código mais fácil de manter.
- Melhoria na interface do usuário, adicionando mais detalhes e informações sobre o clima.
- Melhoria na User Experience, adicionando feedbacks visuais e melhorar a passagem de dados de uma tela para outra.
- Adicionar um base de dados invés de Async Storage para armazenar as cidades favoritas.
- Implementar mais testes unitários para garantir a estabilidade do aplicativo.

## Licença

Este projeto está licenciado sob a MIT License.

## Contribuições

Sinta-se à vontade para fazer contribuições! Envie um pull request ou abra uma issue para sugerir melhorias.

**Autor**: [Thales_Pires]  
**GitHub**: TamagoGamer
