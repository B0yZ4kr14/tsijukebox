# 🤝 Contribuindo

## Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Desenvolva** sua contribuição
5. **Teste** suas mudanças
6. **Commit** seguindo o padrão
7. **Push** para seu fork
8. **Abra** um Pull Request

## Padrões de Código

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança de funcionalidade
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### TypeScript

```typescript
// Use tipos explícitos
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Evite any
// ❌ function process(data: any)
// ✅ function process(data: ProcessData)
```

### React

```tsx
// Use componentes funcionais
const MyComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};

// Use hooks customizados para lógica reutilizável
const useMyHook = () => {
  const [state, setState] = useState();
  // ...
  return { state, setState };
};
```

## Estrutura de Pull Request

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes passando
- [ ] Documentação atualizada
```

## Reportando Bugs

Use o template de issue para bugs:

1. **Descrição** clara do problema
2. **Passos** para reproduzir
3. **Comportamento esperado**
4. **Screenshots** se aplicável
5. **Ambiente** (OS, browser, versão)
