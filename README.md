# Mundi

Catálogo interativo de países feito em **React Native + Expo (TypeScript)**. O usuário cria uma conta local, navega pelos países em uma grade com rolagem infinita, filtra por região, busca por nome e abre os detalhes de cada país. Ele também pode favoritar países e marcar os que já visitou, com uma nota de 1 a 5.

Os dados vêm da API pública **[REST Countries](https://restcountries.com)**, versão **v5**.

> **Sobre a versão da API:** o enunciado previa a v3.1 (`restcountries.com/v3.1`), mas ela foi **desativada**. Hoje, todo endpoint da v3.1 devolve
> `{"success": false, "errors": [{"message": "This API version has been deprecated..."}]}`.
> Por isso o app usa a v5 (`https://api.restcountries.com/countries/v5`), que **exige uma API key gratuita** e tem um formato de resposta diferente. A conversão para os tipos do app fica isolada em `src/services/countriesService.ts`.

## Como rodar

Pré-requisitos: Node 20 ou superior e o app **Expo Go** no celular (ou um emulador).

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie a chave da API: faça uma conta gratuita em <https://restcountries.com/sign-up> e copie a sua API key.
3. Configure o ambiente: copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_API_KEY`.
   ```bash
   cp .env.example .env
   ```
4. Inicie o projeto:
   ```bash
   npx expo start
   ```
   Depois, leia o QR code com o Expo Go.

| Variável | Valor |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | `https://api.restcountries.com/countries/v5` |
| `EXPO_PUBLIC_API_KEY` | a sua chave (o arquivo `.env` está no `.gitignore`) |

> As variáveis `EXPO_PUBLIC_*` são embutidas no bundle do app. Isso é aceitável aqui porque a chave é gratuita e tem cota limitada, mas um app em produção deveria chamar a API por um backend próprio.

Scripts úteis:

| Comando | O que faz |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` (TypeScript estrito) |
| `npm run contrast` | confere o contraste WCAG da paleta (≥ 4.5:1) |

## Estrutura de pastas

```
App.tsx                 apenas Providers + RootNavigator
src/
  constants.ts          PAGE_SIZE, limites, chaves de storage (um único lugar)
  services/             acesso a dados, sem React
    api.ts              instância Axios (baseURL do .env, timeout 10s, Bearer) + toAppError
    countriesService.ts getAll, searchByName, getByCode, getNeighbors + conversão da v5
    storage.ts          wrappers tipados de AsyncStorage com try/catch
    authService.ts      cadastro/login local, hash de senha, sessão
  contexts/             AuthContext, FavoritesContext, VisitedContext
  hooks/                useAuth, useFavorites, useVisited, useFetch, useCountries, useUserStorage
  components/           componentes visuais reutilizáveis (recebem dados por props)
  screens/              Login, Register, Catalog, Search, Details, Favorites, Visited
  navigation/           AuthStack, AppStack, RootNavigator, types.ts (params tipados)
  types/                country.ts (resposta da API + modelos do app), user.ts
  theme/                colors.ts (paleta), spacing.ts (espaços, raios, fontes, sombra)
  utils/                stripHtml.ts, format.ts (números pt-BR, nomes das regiões)
scripts/check-contrast.js
```

## Decisão técnica: paginação no servidor

A rolagem infinita do catálogo (RF01) usa a **paginação nativa da v5** (`limit` + `offset`). A lógica está em `src/hooks/useCountries.ts`:

1. A primeira página é `GET ?limit=20&offset=0` (`PAGE_SIZE = 20`). A API devolve os países em ordem estável por nome e informa `meta.total` e `meta.more`.
2. A cada `onEndReached` (com `onEndReachedThreshold = 0.5`), o hook busca `offset = itens já carregados` e **anexa** a nova página à lista. As flags `loadingMore` e `hasMore`, junto com um `ref` síncrono, impedem disparos em rajada, e o footer mostra um `ActivityIndicator` enquanto a página chega.
3. **Pull-to-refresh** e a **troca de região** recomeçam do `offset=0`. O filtro de região também é aplicado no servidor (`?region=Europe`).
4. **Falhas:** um `AbortController` cancela a requisição anterior quando a região muda ou a tela desmonta. Se a API cair no meio da rolagem, os itens já carregados continuam na tela e o footer mostra o erro com o botão **"Tentar novamente"**, sem ficar repetindo a requisição sozinho.

**Por que não paginar no cliente:** a v3.1 não tinha paginação, e a ideia original era baixar tudo e fatiar em memória. A v5 já pagina no servidor, o que é mais próximo do enunciado ("anexar a próxima página") e evita baixar ~250 registros de uma vez. A rolagem completa do catálogo custa cerca de 13 requisições, o que cabe com folga na cota gratuita de 1.000 por mês.

## Login e persistência

Tudo é local, sem nuvem.

- **Cadastro** (`authService.signUp`):
  - valida o nome, o formato do e-mail, a senha com no mínimo 6 caracteres e se o e-mail já está cadastrado;
  - gera um **salt aleatório de 16 bytes** (`expo-crypto`) e calcula `SHA-256(salt + senha)`;
  - guarda **hash e salt no `expo-secure-store`** (Keychain/Keystore). O AsyncStorage guarda apenas `{ id, nome, e-mail, createdAt }`, e a senha nunca é salva em texto puro.
- **Login:** recalcula o hash com o salt salvo e compara. Quando falha, a mensagem é genérica ("E-mail ou senha incorretos.") para não revelar quais e-mails existem.
- **Sessão:** o id do usuário logado fica em `@mundi:session`. Ao reabrir o app, o `AuthContext` restaura a sessão; enquanto isso, `loading` mostra uma tela de carregamento.
- **Navegação condicional:** o `RootNavigator` renderiza o `AuthStack` ou o `AppStack` conforme `user`. O logout só faz `user = null`; não existe `navigate('Login')`.
- **Favoritos e visitados:** ficam no AsyncStorage com **chave por usuário** (`@mundi:favorites:{userId}` e `@mundi:visited:{userId}`), pelo hook `useUserStorage`:
  - os dados são carregados num `useEffect` quando o usuário muda;
  - um `useEffect` que observa a lista salva as alterações, **só depois da hidratação**, para que o estado vazio inicial nunca sobrescreva os dados;
  - enquanto `hydrated === false`, o app mostra um `ActivityIndicator` em tela cheia, e nunca uma lista vazia por engano;
  - cada favorito ou visitado guarda um objeto mínimo (`code`, `name`, `flagUrl`, `region`, além de `rating` nos visitados), então as listas funcionam sem nova requisição.

## Endpoints usados (v5)

| Uso | Requisição |
| --- | --- |
| Catálogo (paginado) | `GET /countries/v5?limit=20&offset=N[&region=Europe]&response_fields=...` |
| Busca por nome | `GET /countries/v5/name?q={texto}`: o agregado cobre nome comum, oficial, alternativos e nativos, por isso "Brasil" encontra o Brazil. Sem resultados, a lista vem vazia (um eventual 404 também vira lista vazia, não erro). |
| Detalhe | `GET /countries/v5/codes.alpha_3/{cca3}`. Quatro territórios (ex.: Somaliland) vêm sem cca3 na API; para eles o id é o `uuid` do registro e o detalhe usa `GET /countries/v5/uuid/{uuid}`. |
| Vizinhos | `GET /countries/v5/borders/{cca3}`: busca reversa que devolve os países que fazem fronteira, já com o nome |

Todas as requisições enviam `Authorization: Bearer <EXPO_PUBLIC_API_KEY>`. Os erros são convertidos em `AppError`, com mensagens em pt-BR, separando rede, timeout, 404, chave inválida ou cota esgotada (401/403), 429 e 5xx.

## Requisitos → arquivos

| RF | Requisito | Arquivos principais |
| --- | --- | --- |
| RF01 | Catálogo em grade, rolagem infinita, pull-to-refresh, filtro de região | `screens/CatalogScreen.tsx`, `hooks/useCountries.ts`, `components/CountryCard.tsx`, `components/RegionFilter.tsx`, `components/FlagImage.tsx` |
| RF02 | Navegação native-stack, params `{ code }`, título dinâmico, ícones no header | `navigation/AppStack.tsx`, `navigation/types.ts`, `screens/CatalogScreen.tsx` (headerRight), `screens/DetailsScreen.tsx` (`setOptions`) |
| RF03 | Detalhes via Axios, descrição ("Sobre") limpa com `stripHtml`, vizinhos por nome | `screens/DetailsScreen.tsx`, `services/countriesService.ts`, `utils/stripHtml.ts`, `utils/format.ts`, `components/InfoRow.tsx` |
| RF04 | Favoritos com Context API, coração no card e nos detalhes | `contexts/FavoritesContext.tsx`, `hooks/useFavorites.ts`, `components/FavoriteButton.tsx` |
| RF05 | Tela de favoritos com estado vazio | `screens/FavoritesScreen.tsx`, `components/CountryListItem.tsx`, `components/EmptyState.tsx` |
| RF06 | Persistência no AsyncStorage por usuário, hidratação | `hooks/useUserStorage.ts`, `services/storage.ts`, `navigation/AppStack.tsx` (aguarda hidratação), `constants.ts` |
| RF07 | Login/cadastro local, sessão, navegação condicional, países visitados com nota | `services/authService.ts`, `contexts/AuthContext.tsx`, `navigation/RootNavigator.tsx`, `screens/LoginScreen.tsx`, `screens/RegisterScreen.tsx`, `contexts/VisitedContext.tsx`, `components/StarRating.tsx`, `screens/VisitedScreen.tsx` |
| RF08 | Busca com input controlado, lista de resultados, 404 = vazio, AbortController | `screens/SearchScreen.tsx`, `services/countriesService.ts` (`searchByName`) |
| RF09 | Loading, erro com "Tentar novamente", `useFetch<T>` com cleanup | `hooks/useFetch.ts`, `components/LoadingView.tsx`, `components/ErrorView.tsx`, `services/api.ts` (`toAppError`), `components/PrimaryButton.tsx` (`loading`) |
| RF10 | Acessibilidade: labels, roles, estado `selected`, toque ≥ 44, contraste | todos os `components/*`, `theme/colors.ts`, `theme/spacing.ts` (`TOUCH_MIN`), `scripts/check-contrast.js` |

## Acessibilidade (RF10)

- Todo elemento tocável tem `accessible`, `accessibilityRole` e `accessibilityLabel`, e as imagens usam `accessibilityRole="image"`. A descrição textual da bandeira, quando a API a fornece, entra no rótulo.
- Os botões de estado usam `accessibilityState={{ selected }}` e um rótulo que muda: "Adicionar Brasil aos favoritos" / "Remover Brasil dos favoritos", "Marcar/Desmarcar Brasil como visitado".
- No `StarRating`, cada estrela é um botão com rótulo "Dar nota 3 de 5" e estado selecionado.
- O coração do card é **irmão** do botão do card, e não filho, para que o leitor de tela foque cada um separadamente.
- As áreas de toque têm pelo menos 44×44 (`TOUCH_MIN`), e os ícones usam `hitSlop`.
- `allowFontScaling` nunca é desligado, e não há altura fixa em textos: o layout usa `minHeight`, `flexWrap` e `padding`.
- Todos os pares de texto da paleta passam de 4.5:1 (`npm run contrast`), sendo o menor 5.19:1.
- O app usa apenas o tema claro (o modo escuro era opcional).

## Limitações conhecidas

- O plano gratuito da API tem 1.000 requisições por mês. Cada página do catálogo gasta 1 requisição (a rolagem completa, cerca de 13), cada detalhe 1 ou 2 e cada busca 1.
- Os nomes e a descrição dos países aparecem em inglês, como a API os devolve. Os textos da interface estão em português.
- O `expo-secure-store` não funciona na versão web, então o app é pensado para Android e iOS.
