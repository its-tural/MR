import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import {
  ArrowRight, Mail, MessageCircle, Monitor, Server,
  Database, Cloud, Cpu, Lightbulb, Menu, X, ExternalLink, ChevronDown,
} from "lucide-react";

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        opacity: 0.038,
        mixBlendMode: "overlay",
      }}
    />
  );
}

// ─── Magnetic button ──────────────────────────────────────────────────────────
function MagneticButton({
  children,
  href,
  className = "",
  strength = 0.4,
  radius = 90,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const onLeave = () => { x.set(0); y.set(0); };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, radius, strength]);

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

// ─── Custom cursor ────────────────────────────────────────────────────────────
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 120, damping: 18, mass: 0.6 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 18, mass: 0.6 });

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovered(!!t.closest("a, button, [data-hover]"));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      {/* Outer ring — follows with spring lag */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          animate={{ width: hovered ? 56 : 32, height: hovered ? 56 : 32, opacity: hovered ? 0.6 : 0.35 }}
          transition={{ duration: 0.25 }}
          className="rounded-full border border-violet-400"
        />
      </motion.div>
      {/* Inner dot — snaps immediately */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
      </motion.div>
    </>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = value / (1800 / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setCount(value); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [inView, value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Scroll reveal wrapper ────────────────────────────────────────────────────
function Reveal({
  children, delay = 0, className = "", y = 40,
}: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "О нас", href: "#about" },
    { label: "Услуги", href: "#services" },
    { label: "Проекты", href: "#portfolio" },
    { label: "Процесс", href: "#process" },
    { label: "Стоимость", href: "#pricing" },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#06060F]/85 backdrop-blur-2xl border-b border-white/[0.04]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-14 flex items-center justify-between h-[72px]">
          <span className="font-display text-lg font-black tracking-tight text-foreground">
            MR<span className="text-violet-400">.</span>Studio
          </span>
          <div className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {l.label}
              </a>
            ))}
          </div>
          <MagneticButton
            href="#contact"
            strength={0.35}
            radius={80}
            className="hidden md:inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] border border-violet-500/40 text-violet-300 px-5 py-2.5 rounded-full hover:bg-violet-500/10 hover:border-violet-400/70 transition-all duration-300"
          >
            Написать нам
          </MagneticButton>
          <button className="md:hidden text-foreground/70" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#06060F]/96 backdrop-blur-2xl flex flex-col items-center justify-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display text-4xl font-black text-foreground/80 hover:text-violet-400 transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="mt-4 font-mono text-sm text-violet-400 border border-violet-500/40 px-8 py-3 rounded-full">
            Написать нам
          </a>
        </div>
      )}
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const blob1X = useSpring(useMotionValue(0), { stiffness: 30, damping: 20 });
  const blob1Y = useSpring(useMotionValue(0), { stiffness: 30, damping: 20 });
  const blob2X = useSpring(useMotionValue(0), { stiffness: 18, damping: 22 });
  const blob2Y = useSpring(useMotionValue(0), { stiffness: 18, damping: 22 });
  const blob3X = useSpring(useMotionValue(0), { stiffness: 12, damping: 25 });
  const blob3Y = useSpring(useMotionValue(0), { stiffness: 12, damping: 25 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(cx);
      mouseY.set(cy);
      blob1X.set(cx * 40);
      blob1Y.set(cy * 40);
      blob2X.set(cx * -28);
      blob2Y.set(cy * -28);
      blob3X.set(cx * 18);
      blob3Y.set(cy * 18);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY, blob1X, blob1Y, blob2X, blob2Y, blob3X, blob3Y]);

  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-24 overflow-hidden">
      {/* Parallax ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ x: blob1X, y: blob1Y }}
          className="absolute top-[-10%] left-[5%] w-[700px] h-[700px] rounded-full bg-violet-700/20 blur-[160px]"
        />
        <motion.div
          style={{ x: blob2X, y: blob2Y }}
          className="absolute top-[25%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-700/15 blur-[120px]"
        />
        <motion.div
          style={{ x: blob3X, y: blob3Y }}
          className="absolute bottom-[10%] left-[35%] w-[350px] h-[350px] rounded-full bg-purple-800/20 blur-[100px]"
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top meta */}
      <div className="absolute top-[72px] left-0 right-0 flex justify-between items-start px-6 lg:px-14 pt-10">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground/40"
        >
          Коммерческое предложение
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground/40"
        >
          01 — 09
        </motion.span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-14 w-full">
        {/* Giant logotype */}
        <div className="overflow-hidden mb-2">
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display font-black leading-[0.85] tracking-tighter">
              <span className="block text-[clamp(5.5rem,20vw,16rem)] text-foreground">MR</span>
            </h1>
          </motion.div>
        </div>
        <div className="overflow-hidden mb-10">
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block font-display italic font-bold text-[clamp(3rem,11vw,9rem)] leading-[0.9] text-violet-400/85 tracking-tight">
              Studio
            </span>
          </motion.div>
        </div>

        {/* Separator */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-px mb-12 bg-gradient-to-r from-violet-500/60 via-white/10 to-transparent"
        />

        {/* Tagline + stats */}
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <p className="font-display font-bold text-[clamp(1.4rem,3.5vw,2.2rem)] leading-[1.2] text-foreground mb-3">
              Маленькая команда.<br />
              <span className="text-foreground/50">Большие продукты.</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Полный цикл разработки — от идеи до продакшена
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="flex gap-10 justify-end"
          >
            {[
              { v: 15, s: "+", l: "лет опыта" },
              { v: 20, s: "+", l: "проектов" },
              { v: 2, s: "", l: "в команде" },
            ].map((stat) => (
              <div key={stat.l} className="text-center">
                <div className="font-display font-black text-[clamp(2.2rem,5vw,4rem)] leading-none text-foreground">
                  <Counter value={stat.v} suffix={stat.s} />
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1.5">{stat.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground/30">scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={13} className="text-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const values = [
    { title: "Прозрачность", desc: "Открытая коммуникация на каждом этапе. Вы всегда знаете статус проекта." },
    { title: "Ответственность", desc: "Берём на себя архитектуру, сроки и качество. Не просто исполнители — партнёры." },
    { title: "Результат", desc: "Каждый проект — это работающий продукт, а не просто строки кода." },
  ];

  return (
    <section id="about" className="py-32 lg:py-52">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          <div>
            <Reveal>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">О студии</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-foreground mb-10">
                Два<br />разработчика.<br />
                <span className="text-foreground/35">Один результат.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-foreground/55 leading-relaxed text-base mb-5 max-w-md">
                MR Studio — команда двух full-stack разработчиков с суммарным опытом более 15 лет. Мы работали с клиентами из Казахстана, Украины, США, Польши и Сербии.
              </p>
              <p className="text-foreground/80 font-medium italic leading-relaxed text-base max-w-md">
                Мы не просто пишем код — мы погружаемся в задачи бизнеса и берём ответственность за результат.
              </p>
            </Reveal>
          </div>

          <div ref={ref} className="space-y-0 mt-4 lg:mt-16">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.75, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group border-b border-white/[0.05] py-9 flex gap-5 items-start hover:border-violet-500/25 transition-colors duration-500 cursor-default"
              >
                <ArrowRight
                  size={15}
                  className="text-violet-500 mt-1 flex-shrink-0 group-hover:translate-x-1.5 transition-transform duration-300"
                />
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-foreground/40 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────
function Team() {
  const members = [
    {
      initials: "МБ",
      name: "Максим\nБабаев",
      role: "Co-Founder · Full-Stack",
      exp: "7+ лет",
      stack: "PHP · Laravel · React · Vue · Node.js",
      note: "Полный цикл — от архитектуры до деплоя.",
      grad: "from-violet-600 to-indigo-500",
      glow: "group-hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]",
    },
    {
      initials: "РК",
      name: "Роман\nКозин",
      role: "Co-Founder · Backend",
      exp: "8+ лет",
      stack: "PHP · Laravel · PostgreSQL · Docker",
      note: "Специализация — бэкенд и серверная архитектура.",
      grad: "from-indigo-600 to-blue-500",
      glow: "group-hover:shadow-[0_0_60px_rgba(99,102,241,0.15)]",
    },
  ];

  return (
    <section id="team" className="py-24 lg:py-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <Reveal>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">Команда</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-foreground mb-16">
            Люди за<br /><span className="text-foreground/35">проектом</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {members.map((m, i) => (
            <Reveal key={m.initials} delay={i * 0.15}>
              <div className={`group relative border border-white/[0.06] bg-card rounded-2xl p-10 overflow-hidden transition-all duration-500 hover:border-white/10 ${m.glow}`}>
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center font-display font-black text-xl text-white mb-8 flex-shrink-0`}>
                  {m.initials}
                </div>

                <div className="mb-6">
                  <h3 className="font-display font-black text-[2rem] leading-tight text-foreground whitespace-pre-line mb-1.5">{m.name}</h3>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-400/70">{m.role}</span>
                </div>

                <div className="space-y-3 border-t border-white/[0.05] pt-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground w-12">Опыт</span>
                    <span className="font-display font-bold text-lg text-foreground">{m.exp}</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">{m.stack}</p>
                  <p className="text-sm text-foreground/40 italic">{m.note}</p>
                </div>

                <div className={`absolute inset-0 bg-gradient-to-br ${m.grad} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none rounded-2xl`} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
  const services = [
    { n: "01", Icon: Monitor, title: "Фронтенд", desc: "React, Vue, Next.js, Nuxt. Современные SPA и SSR приложения." },
    { n: "02", Icon: Server, title: "Бэкенд", desc: "PHP, Laravel, Node.js. API, микросервисы, сложная бизнес-логика." },
    { n: "03", Icon: Database, title: "Базы данных", desc: "PostgreSQL, MySQL, Redis. Проектирование схем, оптимизация запросов." },
    { n: "04", Icon: Cpu, title: "DevOps", desc: "Docker, CI/CD, GitHub Actions. Автоматизация деплоя и инфраструктуры." },
    { n: "05", Icon: Cloud, title: "Cloud & Хостинг", desc: "AWS, DigitalOcean, Vercel. Настройка серверов и масштабирование." },
    { n: "06", Icon: Lightbulb, title: "Консалтинг", desc: "Аудит кода, архитектура, выбор стека. Помогаем принять верное решение." },
  ];

  return (
    <section id="services" className="py-24 lg:py-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <Reveal>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">Услуги</span>
        </Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <Reveal delay={0.1}>
            <h2 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-foreground">
              Что мы<br /><span className="text-foreground/35">делаем</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest md:text-right">
              Нестандартная задача?<br />
              <a href="https://t.me/mxm_bbv" className="text-violet-400 hover:text-violet-300 transition-colors">t.me/mxm_bbv</a>
            </p>
          </Reveal>
        </div>

        {/* Grid with "border" via gap + background */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
          {services.map(({ n, Icon, title, desc }, i) => (
            <Reveal key={n} delay={i * 0.06}>
              <div className="group bg-background p-10 hover:bg-card transition-all duration-500 relative overflow-hidden h-full">
                <div className="flex items-start justify-between mb-8">
                  <span className="font-mono text-[9px] text-muted-foreground/30">{n}</span>
                  <Icon size={17} className="text-violet-500/50 group-hover:text-violet-400 transition-colors duration-300" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3 group-hover:text-violet-200 transition-colors duration-300">{title}</h3>
                <p className="text-sm text-foreground/35 leading-relaxed">{desc}</p>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-violet-500 to-transparent group-hover:w-full transition-all duration-700" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stack ────────────────────────────────────────────────────────────────────
function Stack() {
  const cats = [
    { label: "Frontend", items: ["React", "Next.js", "Vue", "Nuxt", "TypeScript", "Tailwind CSS", "Vite"] },
    { label: "Backend", items: ["PHP 8.3", "Laravel", "Node.js", "Express", "REST API", "GraphQL"] },
    { label: "Databases", items: ["PostgreSQL", "MySQL", "Redis", "MinIO", "Elasticsearch"] },
    { label: "DevOps", items: ["Docker", "Docker Compose", "GitHub Actions", "CI/CD", "Nginx"] },
    { label: "Cloud", items: ["AWS S3", "EC2", "RDS", "DigitalOcean", "Cloudflare", "Vercel"] },
    { label: "Tools", items: ["Git", "Figma", "Jira", "Notion", "VS Code", "PhpStorm"] },
  ];

  return (
    <section id="stack" className="py-24 lg:py-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <Reveal>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">Технологии</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-foreground mb-20">
            Наш<br /><span className="text-foreground/35">стек</span>
          </h2>
        </Reveal>

        <div>
          {cats.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.07}>
              <div className="group grid grid-cols-[100px_1fr] md:grid-cols-[150px_1fr] gap-8 items-start border-b border-white/[0.05] py-7 hover:border-violet-500/15 transition-colors duration-500">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-400/60 pt-1">{cat.label}</span>
                <div className="flex flex-wrap gap-2.5">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[11px] text-foreground/50 bg-white/[0.03] border border-white/[0.07] px-3 py-1.5 rounded-full hover:text-foreground/80 hover:border-violet-500/30 transition-all duration-200 cursor-default"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Portfolio ────────────────────────────────────────────────────────────────
function Portfolio() {
  const projects = [
    { num: "01", cat: "PropTech", title: "3D Apartments", desc: "Виртуальная платформа поиска жилья с 3D-турами и AR. В 6 городах США.", link: "3dapestment.com" },
    { num: "02", cat: "Tools", title: "QazQR", desc: "Генерация и управление QR-кодами для казахстанского бизнеса.", link: "qaz.qr.kz" },
    { num: "03", cat: "SaaS", title: "Korkortsjakten", desc: "Подготовка к экзамену на права. Швеция. Тысячи активных пользователей.", link: "korkortsjakten.se" },
    { num: "04", cat: "Construction · SaaS", title: "PlanHub", desc: "Управление тендерами в строительстве. Автоматизация документооборота.", link: "planhub.com" },
    { num: "05", cat: "Document Management", title: "Aidocs", desc: "Онлайн-сервис документооборота. Создание, подписание и хранение документов в облаке.", link: "aidocs.kz" },
  ];

  return (
    <section id="portfolio" className="py-24 lg:py-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <Reveal>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">Портфолио</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-foreground mb-20">
            <span className="text-foreground/35">Наши</span><br />проекты
          </h2>
        </Reveal>

        <div className="space-y-0">
          {projects.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.07}>
              <div className="group relative border-b border-white/[0.05] py-10 md:py-12 grid grid-cols-[1fr] md:grid-cols-[1fr_auto] gap-6 items-center hover:border-violet-500/20 transition-all duration-500 cursor-default overflow-hidden">
                {/* Giant faded number */}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 font-display font-black text-[8rem] md:text-[10rem] leading-none text-white/[0.025] group-hover:text-violet-500/[0.07] transition-colors duration-700 select-none pointer-events-none pr-4">
                  {p.num}
                </span>

                {/* Left: content */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
                  {/* Violet left indicator */}
                  <div className="hidden md:block w-px h-14 bg-gradient-to-b from-transparent via-violet-500/40 to-transparent group-hover:via-violet-400/80 transition-colors duration-500 flex-shrink-0" />

                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-2 block group-hover:text-violet-400/60 transition-colors duration-300">{p.cat}</span>
                    <h3 className="font-display font-black text-[1.8rem] md:text-[2.4rem] text-foreground leading-tight group-hover:text-violet-100 transition-colors duration-300">{p.title}</h3>
                    <p className="text-sm text-foreground/35 leading-relaxed mt-2 max-w-xl">{p.desc}</p>
                  </div>
                </div>

                {/* Right: link */}
                <div className="relative z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-x-4 group-hover:translate-x-0">
                  <ExternalLink size={11} className="text-violet-400/60" />
                  <span className="font-mono text-[10px] text-violet-400/60 whitespace-nowrap">{p.link}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Process ──────────────────────────────────────────────────────────────────
function Process() {
  const steps = [
    { n: "01", title: "Знакомство и бриф", desc: "Обсуждаем задачу, цели, сроки. Формируем ТЗ.", tag: "ТЗ" },
    { n: "02", title: "Оценка и план", desc: "Декомпозируем задачи, оцениваем объём и стоимость.", tag: "Смета · Roadmap" },
    { n: "03", title: "Дизайн и прототип", desc: "Проектируем интерфейсы, согласуем визуальное решение.", tag: "Макеты" },
    { n: "04", title: "Разработка", desc: "Итеративная разработка с еженедельными демо.", tag: "Рабочий код" },
    { n: "05", title: "Тестирование", desc: "Функциональное, нагрузочное и security-тестирование.", tag: "QA-отчёт" },
    { n: "06", title: "Запуск и поддержка", desc: "Деплой в продакшен, мониторинг и пост-релизная поддержка.", tag: "Продакшен" },
  ];

  return (
    <section id="process" className="py-24 lg:py-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <Reveal>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">Как мы работаем</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-foreground mb-20">
            <span className="text-foreground/35">Наш</span><br />процесс
          </h2>
        </Reveal>

        <div>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="group grid grid-cols-[70px_1fr] md:grid-cols-[100px_1fr_180px] gap-6 md:gap-14 items-center border-b border-white/[0.05] py-8 hover:border-violet-500/20 transition-all duration-500 cursor-default">
                <span className="font-display font-black text-5xl md:text-7xl text-foreground/[0.07] group-hover:text-violet-500/15 transition-colors duration-500 leading-none">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display font-bold text-xl md:text-2xl text-foreground mb-1.5 group-hover:text-violet-100 transition-colors duration-300">{s.title}</h3>
                  <p className="text-sm text-foreground/35">{s.desc}</p>
                </div>
                <span className="hidden md:block font-mono text-[10px] text-violet-400/50 text-right tracking-widest">{s.tag}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      tag: "Разовый проект",
      title: "Фиксированная\nстоимость",
      desc: "Фиксированный бюджет и сроки. Идеально для MVP, лендингов и небольших продуктов.",
      popular: false,
    },
    {
      tag: "Ежемесячный · Ретейнер",
      title: "Ежемесячная\nподписка",
      desc: "Выделенная команда на постоянной основе. Гибкие задачи, приоритеты и объём часов.",
      popular: true,
    },
    {
      tag: "Консалтинг",
      title: "Почасовая\nоплата",
      desc: "Аудит кода, архитектурные консультации, выбор стека. Точечная экспертиза без долгосрочных обязательств.",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 lg:py-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <Reveal>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">Стоимость</span>
        </Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <Reveal delay={0.1}>
            <h2 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-foreground">
              Условия<br /><span className="text-foreground/35">сотрудничества</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-foreground/35 text-sm max-w-xs leading-relaxed">
              Стоимость обсуждается индивидуально в зависимости от объёма задач и сроков.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className={`relative rounded-2xl p-10 border transition-all duration-500 h-full flex flex-col justify-between ${
                p.popular
                  ? "bg-violet-950/30 border-violet-500/40 hover:border-violet-400/60 shadow-[0_0_60px_rgba(139,92,246,0.08)]"
                  : "bg-card border-white/[0.06] hover:border-white/10"
              }`}>
                {p.popular && (
                  <div className="absolute -top-3.5 left-8">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-violet-500 text-white px-3.5 py-1 rounded-full">Популярно</span>
                  </div>
                )}
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-6 block">{p.tag}</span>
                  <h3 className="font-display font-bold text-[1.6rem] text-foreground mb-5 whitespace-pre-line leading-tight">{p.title}</h3>
                  <p className="text-sm text-foreground/40 leading-relaxed">{p.desc}</p>
                </div>
                <a
                  href="#contact"
                  className={`mt-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    p.popular ? "text-violet-300 hover:text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Обсудить <ArrowRight size={11} />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" className="relative min-h-[85vh] flex items-center py-24 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-violet-800/15 rounded-full blur-[160px]" />
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-14 w-full relative">
        <div className="max-w-2xl">
          <Reveal>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400 mb-8 block">Контакты</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display font-black text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] tracking-tight text-foreground mb-10">
              Готовы<br />начать?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-foreground/45 text-lg mb-16 max-w-sm leading-relaxed">
              Расскажите о своём проекте. Ответим в течение 24 часов и предложим оптимальное решение.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              { name: "Максим", email: "mxm.bbv.05@gmail.com", tg: "t.me/mxm_bbv" },
              { name: "Роман", email: "romanovich.dev", tg: "t.me/romanovich_dev" },
            ].map((c, i) => (
              <Reveal key={c.name} delay={0.3 + i * 0.1}>
                <div className="group border border-white/[0.06] rounded-xl p-6 hover:border-violet-500/25 transition-all duration-300">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-3 block">{c.name}</span>
                  <p className="font-mono text-sm text-foreground/70 group-hover:text-violet-200 transition-colors duration-300 mb-1">{c.email}</p>
                  <p className="font-mono text-xs text-violet-400/50">{c.tg}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5}>
            <MagneticButton
              href="https://t.me/mxm_bbv"
              strength={0.5}
              radius={110}
              className="inline-flex items-center gap-3 bg-violet-600 hover:bg-violet-500 text-white font-mono text-[11px] uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
            >
              <MessageCircle size={15} />
              Написать нам
            </MagneticButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display font-black text-foreground/20">
          MR<span className="text-violet-400/20">.</span>Studio
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/20 uppercase tracking-[0.2em]">
          © 2025 · Все права защищены
        </span>
        <div className="flex gap-6">
          <a href="mailto:mxm.bbv.05@gmail.com" className="text-muted-foreground/30 hover:text-foreground/60 transition-colors duration-200">
            <Mail size={14} />
          </a>
          <a href="https://t.me/mxm_bbv" className="text-muted-foreground/30 hover:text-foreground/60 transition-colors duration-200">
            <MessageCircle size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden [cursor:none]">
      <GrainOverlay />
      <CustomCursor />
      <Nav />
      <Hero />
      <About />
      <Team />
      <Services />
      <Stack />
      <Portfolio />
      <Process />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
