<div align="center">

# 🎨 Design System

[![Stage Neon Metallic](https://img.shields.io/badge/Theme-Stage_Neon_Metallic-00FFFF?style=for-the-badge)](https://github.com/B0yZ4kr14/tsijukebox)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1_AA-22c55e?style=for-the-badge)](https://www.w3.org/WAI/WCAG21/quickref/)

**Sistema de design visual do TSiJUKEBOX**

</div>

---

## 🎨 Temas Visuais

<table>
<tr>
<td align="center" width="33%">

### 🌌 Cosmic Player

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/theme-references/theme-cosmic-player.png" width="150">

</td>
<td align="center" width="33%">

### 🎤 Karaoke Stage

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/theme-references/theme-karaoke-stage.png" width="150">

</td>
<td align="center" width="33%">

### 🏠 Dashboard Home

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/theme-references/theme-dashboard-home.png" width="150">

</td>
</tr>
<tr>
<td align="center">

### 🎵 Spotify Integration

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/theme-references/theme-spotify-integration.png" width="150">

</td>
<td align="center">

### ⚙️ Settings Dark

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/theme-references/theme-settings-dark.png" width="150">

</td>
<td align="center">

### ✨ Stage Neon Metallic

`--accent-cyan: #00ffff`
`--accent-magenta: #ff00d4`

</td>
</tr>
</table>

---

## 🎨 Paleta de Cores

### Cores Base

<table>
<tr>
<td align="center">

![#09090B](https://via.placeholder.com/50/09090B/09090B?text=+)

`#09090B`
**Background**

</td>
<td align="center">

![#18181B](https://via.placeholder.com/50/18181B/18181B?text=+)

`#18181B`
**Card**

</td>
<td align="center">

![#27272A](https://via.placeholder.com/50/27272A/27272A?text=+)

`#27272A`
**Border**

</td>
</tr>
</table>

### Cores Neon

<table>
<tr>
<td align="center">

![#FBB724](https://via.placeholder.com/50/FBB724/FBB724?text=+)

`#FBB724`
**Gold Neon**
Destaques, CTAs

</td>
<td align="center">

![#00D4FF](https://via.placeholder.com/50/00D4FF/00D4FF?text=+)

`#00D4FF`
**Cyan Neon**
Links, interações

</td>
<td align="center">

![#FF00FF](https://via.placeholder.com/50/FF00FF/FF00FF?text=+)

`#FF00FF`
**Magenta**
Alertas, badges

</td>
<td align="center">

![#22C55E](https://via.placeholder.com/50/22C55E/22C55E?text=+)

`#22C55E`
**Green**
Sucesso

</td>
<td align="center">

![#EF4444](https://via.placeholder.com/50/EF4444/EF4444?text=+)

`#EF4444`
**Red**
Erro

</td>
</tr>
</table>

---

## 📝 Tipografia

<table>
<tr>
<td width="50%">

### Fonte Principal

```css
font-family: 'Inter', system-ui, sans-serif;
```

</td>
<td width="50%">

### Tamanhos

| Token | Tamanho |
|-------|:-------:|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 24px |
| `text-3xl` | 30px |
| `text-4xl` | 36px |

</td>
</tr>
</table>

---

## 🧩 Componentes

### Button

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="spotify">Spotify</Button>
<Button variant="youtube">YouTube</Button>
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Rodapé</CardFooter>
</Card>
```

### Badge

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
```

---

## ✨ Animações

```css
/* Transições */
--transition-fast: 150ms ease;
--transition-normal: 300ms ease;
--transition-slow: 500ms ease;

/* Efeitos Neon */
.neon-glow {
  text-shadow: 0 0 10px currentColor,
               0 0 20px currentColor,
               0 0 30px currentColor;
}
```

---

## 📏 Espaçamento

<table>
<tr>
<td>

| Token | Valor |
|-------|:-----:|
| `spacing-1` | 4px |
| `spacing-2` | 8px |
| `spacing-3` | 12px |
| `spacing-4` | 16px |

</td>
<td>

| Token | Valor |
|-------|:-----:|
| `spacing-6` | 24px |
| `spacing-8` | 32px |
| `spacing-12` | 48px |
| `spacing-16` | 64px |

</td>
</tr>
</table>

---

## 🗂️ Ícones Customizados

<table>
<tr>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/installation.png" width="48">

**Installation**

</td>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/configuration.png" width="48">

**Configuration**

</td>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/development.png" width="48">

**Development**

</td>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/api.png" width="48">

**API**

</td>
</tr>
<tr>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/monitoring.png" width="48">

**Monitoring**

</td>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/security.png" width="48">

**Security**

</td>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/testing.png" width="48">

**Testing**

</td>
<td align="center">

<img src="https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/docs/assets/icons/tutorials.png" width="48">

**Tutorials**

</td>
</tr>
</table>

---

## 🔗 Recursos

<table>
<tr>
<td align="center">

[![Demo](https://img.shields.io/badge/🌐-Demo-00D4FF?style=for-the-badge)](https://tsijukebox.vercel.app)

</td>
<td align="center">

[![Mockups](https://img.shields.io/badge/🎭-Mockups-FFD400?style=for-the-badge)](https://github.com/B0yZ4kr14/tsijukebox/blob/main/docs/mockups/index.html)

</td>
</tr>
</table>

---

<p align="center">
  <a href="Home">← Voltar para Home</a> | <a href="Themes">Temas →</a>
</p>
