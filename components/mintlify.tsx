/**
 * Drop-in replacements for the Mintlify MDX components used across the docs, so the
 * content could be ported without rewriting pages. Styling lives in `app/global.css`
 * under the `pg-*` class names.
 */
import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import Link from 'fumadocs-core/link';
import { Tab as FumaTab, Tabs as FumaTabs } from 'fumadocs-ui/components/tabs';
import {
  ArrowRight,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Info as InfoIcon,
  Lightbulb,
  OctagonAlert,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from './icons';

/* -------------------------------------------------------------------------- */
/* Callouts                                                                    */
/* -------------------------------------------------------------------------- */

type CalloutType = 'note' | 'info' | 'tip' | 'warning' | 'check' | 'danger';

const calloutIcons: Record<CalloutType, typeof InfoIcon> = {
  note: StickyNote,
  info: InfoIcon,
  tip: Lightbulb,
  warning: CircleAlert,
  check: CircleCheck,
  danger: OctagonAlert,
};

function Callout({
  type,
  title,
  icon,
  children,
}: {
  type: CalloutType;
  title?: ReactNode;
  icon?: string;
  children?: ReactNode;
}) {
  const DefaultIcon = calloutIcons[type];
  return (
    <div className="pg-callout not-prose" data-type={type} role="note">
      <span className="pg-callout-icon">
        {icon ? <Icon name={icon} /> : <DefaultIcon />}
      </span>
      <div className="pg-callout-body prose">
        {title && <p className="font-medium">{title}</p>}
        {children}
      </div>
    </div>
  );
}

type CalloutProps = { title?: ReactNode; icon?: string; children?: ReactNode };
export const Note = (p: CalloutProps) => <Callout type="note" {...p} />;
export const Info = (p: CalloutProps) => <Callout type="info" {...p} />;
export const Tip = (p: CalloutProps) => <Callout type="tip" {...p} />;
export const Warning = (p: CalloutProps) => <Callout type="warning" {...p} />;
export const Check = (p: CalloutProps) => <Callout type="check" {...p} />;
export const Danger = (p: CalloutProps) => <Callout type="danger" {...p} />;

/* -------------------------------------------------------------------------- */
/* Cards                                                                       */
/* -------------------------------------------------------------------------- */

export function Card({
  title,
  icon,
  href,
  arrow,
  cta,
  horizontal,
  img,
  children,
}: {
  title?: ReactNode;
  icon?: string;
  href?: string;
  arrow?: boolean | string;
  cta?: string;
  horizontal?: boolean;
  img?: string;
  children?: ReactNode;
}) {
  const external = href ? /^https?:\/\//.test(href) : false;
  const showArrow = arrow === true || arrow === 'true' || (arrow === undefined && external);

  const content = (
    <>
      {img && <img src={img} alt="" className="pg-card-img" />}
      <div className={cn('pg-card-inner', horizontal && 'pg-card-horizontal')}>
        {icon && (
          <span className="pg-card-icon">
            <Icon name={icon} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <p className="pg-card-title">
              {title}
              {showArrow && <ArrowRight className="pg-card-arrow" />}
            </p>
          )}
          {children && <div className="pg-card-content prose">{children}</div>}
          {cta && (
            <p className="pg-card-cta">
              {cta}
              <ChevronRight className="size-3.5" />
            </p>
          )}
        </div>
      </div>
    </>
  );

  if (!href) return <div className="pg-card not-prose">{content}</div>;
  // A full-card overlay link instead of wrapping the card in <a>: card bodies can contain
  // their own links, and nested <a> elements are invalid HTML (hydration errors).
  return (
    <div className="pg-card pg-card-link not-prose" data-card="">
      <Link
        href={href}
        external={external}
        className="pg-card-overlay"
        aria-label={typeof title === 'string' ? title : cta}
      />
      {content}
    </div>
  );
}

export function CardGroup({ cols = 2, children }: { cols?: number; children?: ReactNode }) {
  return (
    <div className="pg-card-group not-prose" style={{ '--pg-cols': cols } as React.CSSProperties}>
      {children}
    </div>
  );
}

export const Columns = CardGroup;

/* -------------------------------------------------------------------------- */
/* Steps                                                                       */
/* -------------------------------------------------------------------------- */

export function Steps({ children }: { children?: ReactNode }) {
  return <div className="pg-steps">{children}</div>;
}

export function Step({
  title,
  icon,
  children,
}: {
  title?: ReactNode;
  icon?: string;
  stepNumber?: number;
  titleSize?: string;
  children?: ReactNode;
}) {
  return (
    <div className="pg-step">
      <span className="pg-step-marker" aria-hidden>
        {icon ? <Icon name={icon} className="size-3.5" /> : null}
      </span>
      {title && <p className="pg-step-title">{title}</p>}
      <div className="pg-step-content">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                        */
/* -------------------------------------------------------------------------- */

type TabElement = ReactElement<{ title?: string; children?: ReactNode }>;

export function Tabs({ children }: { children?: ReactNode }) {
  const tabs = Children.toArray(children).filter(
    (child): child is TabElement => isValidElement(child),
  );
  const items = tabs.map((tab, i) => tab.props.title ?? `Tab ${i + 1}`);

  return (
    <FumaTabs items={items}>
      {tabs.map((tab, i) => (
        <FumaTab key={items[i]} value={items[i]}>
          {tab.props.children}
        </FumaTab>
      ))}
    </FumaTabs>
  );
}

/** Only rendered through <Tabs>, which reads its props directly. */
export function Tab({ children }: { title?: string; children?: ReactNode }) {
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/* Accordions & Expandables                                                    */
/* -------------------------------------------------------------------------- */

function slugify(value: unknown) {
  return typeof value === 'string'
    ? value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : undefined;
}

export function Accordion({
  title,
  description,
  icon,
  defaultOpen,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: string;
  defaultOpen?: boolean;
  children?: ReactNode;
}) {
  return (
    <details className="pg-accordion" open={defaultOpen} id={slugify(title)}>
      <summary>
        <ChevronRight className="pg-accordion-chevron" />
        {icon && <Icon name={icon} className="size-4 shrink-0 text-fd-muted-foreground" />}
        <span className="flex-1">
          <span className="font-medium">{title}</span>
          {description && (
            <span className="block text-sm text-fd-muted-foreground">{description}</span>
          )}
        </span>
      </summary>
      <div className="pg-accordion-content prose">{children}</div>
    </details>
  );
}

export function AccordionGroup({ children }: { children?: ReactNode }) {
  return <div className="pg-accordion-group">{children}</div>;
}

export function Expandable({
  title = 'properties',
  defaultOpen,
  children,
}: {
  title?: string;
  defaultOpen?: boolean;
  children?: ReactNode;
}) {
  return (
    <details className="pg-expandable" open={defaultOpen}>
      <summary>
        <ChevronRight className="pg-accordion-chevron" />
        <span className="pg-expandable-closed">Show {title}</span>
        <span className="pg-expandable-open">Hide {title}</span>
      </summary>
      <div className="pg-expandable-content">{children}</div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* API fields                                                                  */
/* -------------------------------------------------------------------------- */

export function ResponseField({
  name,
  type,
  required,
  default: defaultValue,
  deprecated,
  post,
  pre,
  children,
}: {
  name: string;
  type?: string;
  required?: boolean;
  default?: unknown;
  deprecated?: boolean;
  post?: string[];
  pre?: string[];
  children?: ReactNode;
}) {
  const id = slugify(name);
  return (
    <div className="pg-field" id={id ? `field-${id}` : undefined}>
      <div className="pg-field-header">
        {pre?.map((p) => (
          <span key={p} className="pg-field-pill">
            {p}
          </span>
        ))}
        <code className="pg-field-name">{name}</code>
        {type && <span className="pg-field-type">{type}</span>}
        {defaultValue !== undefined && (
          <span className="pg-field-pill">
            default: <code>{String(defaultValue)}</code>
          </span>
        )}
        {post?.map((p) => (
          <span key={p} className="pg-field-pill">
            {p}
          </span>
        ))}
        {required && <span className="pg-field-required">required</span>}
        {deprecated && <span className="pg-field-deprecated">deprecated</span>}
      </div>
      {children && <div className="pg-field-body prose">{children}</div>}
    </div>
  );
}

export const ParamField = ResponseField;

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export function Frame({
  caption,
  hint,
  children,
}: {
  caption?: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <figure className="pg-frame not-prose">
      <div className="pg-frame-inner">
        {hint && <p className="pg-frame-hint">{hint}</p>}
        {children}
        {caption && <figcaption>{caption}</figcaption>}
      </div>
    </figure>
  );
}

export function Iframe(props: ComponentProps<'iframe'>) {
  return (
    <Frame>
      <iframe {...props} />
    </Frame>
  );
}

export function Video(props: ComponentProps<'video'>) {
  return (
    <Frame>
      <video {...props} />
    </Frame>
  );
}

/** plain <img>: content images are referenced by absolute `/images/...` paths */
export function Img({
  centered: _centered,
  noZoom: _noZoom,
  ...props
}: ComponentProps<'img'> & { centered?: boolean; noZoom?: boolean }) {
  return <img loading="lazy" {...props} alt={props.alt ?? ''} />;
}

/* -------------------------------------------------------------------------- */
/* Misc                                                                        */
/* -------------------------------------------------------------------------- */

export function Update({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="pg-update" id={slugify(label)}>
      <div className="pg-update-meta">
        <span className="pg-field-pill">{label}</span>
        {description && <p className="text-sm text-fd-muted-foreground">{description}</p>}
      </div>
      <div className="prose">{children}</div>
    </div>
  );
}

export function MintLink(props: ComponentProps<'a'>) {
  const external = props.href ? /^https?:\/\//.test(props.href) : false;
  return <Link {...props} href={props.href ?? '#'} external={external} />;
}

export const mintlifyComponents = {
  Note,
  Info,
  Tip,
  Warning,
  Check,
  Danger,
  Card,
  CardGroup,
  Columns,
  Steps,
  Step,
  Tabs,
  Tab,
  Accordion,
  AccordionGroup,
  Expandable,
  ResponseField,
  ParamField,
  Frame,
  iframe: Iframe,
  video: Video,
  Update,
  Link: MintLink,
  img: Img,
};
