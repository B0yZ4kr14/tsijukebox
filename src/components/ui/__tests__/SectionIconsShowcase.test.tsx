/**
 * SectionIconsShowcase Component Tests
 * 
 * Unit tests covering:
 * - Grid and List variants rendering
 * - Hover effects and animations
 * - Icon data integrity
 * - Accessibility
 * 
 * @author B0.y_Z4kr14
 * @version 1.0.0
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SectionIconsShowcase, sectionIcons } from '../SectionIconsShowcase';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('SectionIconsShowcase', () => {
  describe('Data Integrity', () => {
    it('should export exactly 8 section icons', () => {
      expect(sectionIcons).toHaveLength(8);
    });

    it('should have all required properties for each icon', () => {
      const requiredProps = ['id', 'name', 'color', 'colorName', 'hex', 'icon', 'description', 'imagePath'];
      
      sectionIcons.forEach((icon) => {
        requiredProps.forEach((prop) => {
          expect(icon).toHaveProperty(prop);
        });
      });
    });

    it('should have valid hex color codes', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      
      sectionIcons.forEach((icon) => {
        expect(icon.hex).toMatch(hexRegex);
      });
    });

    it('should have unique IDs for all icons', () => {
      const ids = sectionIcons.map((icon) => icon.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should contain the expected icon IDs', () => {
      const expectedIds = [
        'installation',
        'configuration',
        'tutorials',
        'development',
        'api',
        'security',
        'monitoring',
        'testing',
      ];
      
      const actualIds = sectionIcons.map((icon) => icon.id);
      
      expectedIds.forEach((id) => {
        expect(actualIds).toContain(id);
      });
    });
  });

  describe('Grid Variant', () => {
    it('should render in grid mode by default', () => {
      render(<SectionIconsShowcase />);
      
      // Should render 8 icons
      const icons = screen.getAllByRole('heading', { level: 3 });
      expect(icons).toHaveLength(8);
    });

    it('should render all 8 icon names in grid mode', () => {
      render(<SectionIconsShowcase variant="grid" />);
      
      expect(screen.getByText('Instalação')).toBeInTheDocument();
      expect(screen.getByText('Configuração')).toBeInTheDocument();
      expect(screen.getByText('Tutoriais')).toBeInTheDocument();
      expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Segurança')).toBeInTheDocument();
      expect(screen.getByText('Monitoramento')).toBeInTheDocument();
      expect(screen.getByText('Testes')).toBeInTheDocument();
    });

    it('should display color names in grid mode', () => {
      render(<SectionIconsShowcase variant="grid" />);
      
      expect(screen.getByText('Verde Neon')).toBeInTheDocument();
      expect(screen.getByText('Cyan')).toBeInTheDocument();
      expect(screen.getByText('Magenta')).toBeInTheDocument();
      expect(screen.getByText('Amarelo Ouro')).toBeInTheDocument();
      expect(screen.getByText('Roxo')).toBeInTheDocument();
      expect(screen.getByText('Laranja')).toBeInTheDocument();
      expect(screen.getByText('Verde Lima')).toBeInTheDocument();
      expect(screen.getByText('Azul Elétrico')).toBeInTheDocument();
    });

    it('should display hex codes in grid mode', () => {
      render(<SectionIconsShowcase variant="grid" />);
      
      expect(screen.getByText('#00ff88')).toBeInTheDocument();
      expect(screen.getByText('#00d4ff')).toBeInTheDocument();
      expect(screen.getByText('#ff00d4')).toBeInTheDocument();
      expect(screen.getByText('#ffd400')).toBeInTheDocument();
      expect(screen.getByText('#d400ff')).toBeInTheDocument();
      expect(screen.getByText('#ff4400')).toBeInTheDocument();
      expect(screen.getByText('#00ff44')).toBeInTheDocument();
      expect(screen.getByText('#4400ff')).toBeInTheDocument();
    });

    it('should have grid layout classes', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" />);
      
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid');
    });
  });

  describe('List Variant', () => {
    it('should render in list mode when specified', () => {
      render(<SectionIconsShowcase variant="list" />);
      
      // Should render 8 icons with descriptions
      expect(screen.getByText('Guias de instalação e setup do sistema')).toBeInTheDocument();
      expect(screen.getByText('Ajustes e preferências do sistema')).toBeInTheDocument();
    });

    it('should display descriptions in list mode', () => {
      render(<SectionIconsShowcase variant="list" />);
      
      const descriptions = [
        'Guias de instalação e setup do sistema',
        'Ajustes e preferências do sistema',
        'Guias passo-a-passo e documentação',
        'API, contribuição e desenvolvimento',
        'Endpoints, storage e integração',
        'Autenticação, SSL e permissões',
        'Health checks, logs e métricas',
        'QA, validação e CI/CD',
      ];
      
      descriptions.forEach((desc) => {
        expect(screen.getByText(desc)).toBeInTheDocument();
      });
    });

    it('should have space-y layout in list mode', () => {
      const { container } = render(<SectionIconsShowcase variant="list" />);
      
      const listContainer = container.firstChild;
      expect(listContainer).toHaveClass('space-y-4');
    });
  });

  describe('showImages Prop', () => {
    it('should render Lucide icons by default (showImages=false)', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" showImages={false} />);
      
      // Should not have img elements
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(0);
    });

    it('should render PNG images when showImages=true', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" showImages={true} />);
      
      // Should have 8 img elements
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(8);
    });

    it('should have correct image paths when showImages=true', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" showImages={true} />);
      
      const images = container.querySelectorAll('img');
      
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('src', sectionIcons[index].imagePath);
        expect(img).toHaveAttribute('alt', sectionIcons[index].name);
      });
    });
  });

  describe('Hover Effects', () => {
    it('should have hover transition classes in grid mode', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" />);
      
      const cards = container.querySelectorAll('.rounded-xl');
      
      cards.forEach((card) => {
        expect(card).toHaveClass('transition-all');
        expect(card).toHaveClass('hover:border-border-hover');
        expect(card).toHaveClass('hover:shadow-lg');
      });
    });

    it('should have hover transition classes in list mode', () => {
      const { container } = render(<SectionIconsShowcase variant="list" />);
      
      const items = container.querySelectorAll('.rounded-lg');
      
      items.forEach((item) => {
        expect(item).toHaveClass('transition-colors');
        expect(item).toHaveClass('hover:border-border-hover');
      });
    });

    it('should apply glow effect on icon containers', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" showImages={false} />);
      
      // Icon containers should have inline style with boxShadow
      const iconContainers = container.querySelectorAll('.rounded-xl.bg-bg-tertiary');
      
      iconContainers.forEach((container, index) => {
        const style = container.getAttribute('style');
        expect(style).toContain('box-shadow');
        expect(style).toContain(sectionIcons[index].hex);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<SectionIconsShowcase variant="grid" />);
      
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(8);
    });

    it('should have alt text on images when showImages=true', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" showImages={true} />);
      
      const images = container.querySelectorAll('img');
      
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should have semantic structure for screen readers', () => {
      const { container } = render(<SectionIconsShowcase variant="list" />);
      
      // Check for proper text hierarchy
      const names = container.querySelectorAll('h3');
      const descriptions = container.querySelectorAll('p');
      
      expect(names.length).toBeGreaterThan(0);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Color Classes', () => {
    it('should apply correct Tailwind color classes', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" showImages={false} />);
      
      const expectedClasses = [
        'text-accent-greenNeon',
        'text-accent-cyan',
        'text-accent-magenta',
        'text-accent-yellowGold',
        'text-accent-purple',
        'text-accent-orange',
        'text-accent-greenLime',
        'text-accent-blueElectric',
      ];
      
      expectedClasses.forEach((className) => {
        const element = container.querySelector(`.${className}`);
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(<SectionIconsShowcase variant="grid" />);
      
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid-cols-2');
      expect(gridContainer).toHaveClass('md:grid-cols-4');
    });
  });

  describe('Animation Integration', () => {
    it('should render motion components without errors', () => {
      expect(() => {
        render(<SectionIconsShowcase variant="grid" />);
      }).not.toThrow();
    });

    it('should render motion components in list mode without errors', () => {
      expect(() => {
        render(<SectionIconsShowcase variant="list" />);
      }).not.toThrow();
    });
  });
});

describe('sectionIcons Export', () => {
  it('should be importable as a named export', () => {
    expect(sectionIcons).toBeDefined();
    expect(Array.isArray(sectionIcons)).toBe(true);
  });

  it('should have Installation icon with correct data', () => {
    const installation = sectionIcons.find((icon) => icon.id === 'installation');
    
    expect(installation).toBeDefined();
    expect(installation?.name).toBe('Instalação');
    expect(installation?.hex).toBe('#00ff88');
    expect(installation?.colorName).toBe('Verde Neon');
  });

  it('should have Configuration icon with correct data', () => {
    const configuration = sectionIcons.find((icon) => icon.id === 'configuration');
    
    expect(configuration).toBeDefined();
    expect(configuration?.name).toBe('Configuração');
    expect(configuration?.hex).toBe('#00d4ff');
    expect(configuration?.colorName).toBe('Cyan');
  });

  it('should have all image paths pointing to correct directory', () => {
    sectionIcons.forEach((icon) => {
      expect(icon.imagePath).toMatch(/^\/docs\/assets\/icons\/.+\.png$/);
    });
  });
});
