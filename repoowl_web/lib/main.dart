// ============================================================
//  RepoOwl Landing Page — lib/main.dart
//  Self-contained. Does NOT touch any other folder of the ext.
// ============================================================

import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_svg/flutter_svg.dart';

// --------------- Constants ---------------

class AppColors {
  static const background = Color(0xFF0D1117);
  static const surface = Color(0xFF161B22);
  static const border = Color(0xFF30363D);
  static const accent = Color(0xFFFF5722);
  static const accentBlue = Color(0xFF2F81F7);
  static const textPrimary = Color(0xFFF0F6FC);
  static const textSecondary = Color(0xFF8B949E);
  static const terminalGreen = Color(0xFF3FB950);
  static const terminalYellow = Color(0xFFD29922);
  static const terminalRed = Color(0xFFDA3633);
  static const purple = Color(0xFF8B5CF6);
}

class AppLinks {
  static const githubRepo = 'https://github.com/YashK-194/RepoOwl';
  static const downloadZip =
      'https://github.com/YashK-194/RepoOwl/releases/latest/download/RepoOwl.zip';
  static const license =
      'https://github.com/YashK-194/RepoOwl/blob/main/LICENSE';
}

// --------------- Main App ---------------

void main() {
  runApp(const RepoOwlApp());
}

class RepoOwlApp extends StatelessWidget {
  const RepoOwlApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RepoOwl — AI-Powered GitHub Issue Triage',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        fontFamily: 'Inter',
        colorScheme: const ColorScheme.dark(
          primary: AppColors.accent,
          surface: AppColors.surface,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

// --------------- Responsive Helper ---------------

class R {
  static bool mobile(BuildContext c) => MediaQuery.of(c).size.width < 600;
  static bool tablet(BuildContext c) =>
      MediaQuery.of(c).size.width >= 600 && MediaQuery.of(c).size.width < 900;
  static bool desktop(BuildContext c) => MediaQuery.of(c).size.width >= 900;
}

// --------------- URL launch utility ---------------

Future<void> launch(String url) async {
  final uri = Uri.parse(url);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

// ================================================================
//  Splash Screen
// ================================================================

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // --- Logo entrance
  late final AnimationController _enter;
  late final Animation<double> _enterScale;
  late final Animation<double> _enterFade;

  // --- Glow pulse
  late final AnimationController _pulse;
  late final Animation<double> _pulseAnim;

  // --- Radar scan line
  late final AnimationController _scan;
  late final Animation<double> _scanAngle;

  // --- Status typewriter
  late final AnimationController _text;
  late final Animation<int> _textChars;
  static const _statusMsg = 'Initializing RepoOwl...';

  // --- Exit fade
  late final AnimationController _exit;
  late final Animation<double> _exitFade;

  bool _done = false;

  @override
  void initState() {
    super.initState();

    // Entrance
    _enter = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800));
    _enterScale = Tween<double>(begin: 0.55, end: 1.0).animate(
        CurvedAnimation(parent: _enter, curve: Curves.elasticOut));
    _enterFade = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(
            parent: _enter, curve: const Interval(0, 0.5, curve: Curves.easeIn)));

    // Pulse glow
    _pulse = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1800))
      ..repeat(reverse: true);
    _pulseAnim = CurvedAnimation(parent: _pulse, curve: Curves.easeInOut);

    // Radar
    _scan = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2000))
      ..repeat();
    _scanAngle = Tween<double>(begin: 0, end: 1).animate(_scan);

    // Typewriter
    _text = AnimationController(
        vsync: this,
        duration: Duration(
            milliseconds: (_statusMsg.length * 55).clamp(800, 2000)));
    _textChars = IntTween(begin: 0, end: _statusMsg.length).animate(
        CurvedAnimation(parent: _text, curve: Curves.easeOut));

    // Exit
    _exit = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _exitFade = Tween<double>(begin: 1, end: 0).animate(
        CurvedAnimation(parent: _exit, curve: Curves.easeIn));

    // Sequence
    _enter.forward().then((_) {
      _text.forward().then((_) {
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            _exit.forward().then((_) {
              if (mounted) setState(() => _done = true);
            });
          }
        });
      });
    });
  }

  @override
  void dispose() {
    _enter.dispose();
    _pulse.dispose();
    _scan.dispose();
    _text.dispose();
    _exit.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_done) return const LandingPage();
    return FadeTransition(
      opacity: _exitFade.status == AnimationStatus.forward
          ? _exitFade
          : const AlwaysStoppedAnimation(1.0),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // ── Animated logo ring
              FadeTransition(
                opacity: _enterFade,
                child: ScaleTransition(
                  scale: _enterScale,
                  child: SizedBox(
                    width: 160,
                    height: 160,
                    child: AnimatedBuilder(
                      animation: Listenable.merge([_pulseAnim, _scanAngle]),
                      builder: (_, __) {
                        return CustomPaint(
                          painter: _OwlRingPainter(
                            pulse: _pulseAnim.value,
                            scan: _scanAngle.value,
                          ),
                          child: Center(
                            child: SvgPicture.asset(
                              'assets/OWL.svg',
                              width: 72,
                              height: 72,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 36),
              // ── Brand name
              FadeTransition(
                opacity: _enterFade,
                child: const Text(
                  'RepoOwl',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.8,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              FadeTransition(
                opacity: _enterFade,
                child: const Text(
                  'AI-Powered GitHub Issue Triage',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              // ── Typewriter status
              AnimatedBuilder(
                animation: _textChars,
                builder: (_, __) {
                  final shown = _statusMsg.substring(0, _textChars.value);
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.accent,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.accent.withValues(alpha: 0.6),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 9),
                      Text(
                        shown,
                        style: const TextStyle(
                          fontFamily: 'JetBrains Mono',
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          letterSpacing: 0.3,
                        ),
                      ),
                      _InlineCursor(),
                    ],
                  );
                },
              ),
              const SizedBox(height: 56),
              // ── Progress bar
              FadeTransition(
                opacity: _enterFade,
                child: SizedBox(
                  width: 200,
                  child: AnimatedBuilder(
                    animation: _text,
                    builder: (_, __) => ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: _text.value,
                        minHeight: 2,
                        backgroundColor:
                            AppColors.border.withValues(alpha: 0.5),
                        valueColor: const AlwaysStoppedAnimation<Color>(
                            AppColors.accent),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Custom painter: glow ring + radar sweep
class _OwlRingPainter extends CustomPainter {
  final double pulse;
  final double scan;
  const _OwlRingPainter({required this.pulse, required this.scan});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final radius = size.width / 2 - 8;

    // Outer glow ring
    final glowPaint = Paint()
      ..color = AppColors.accent.withValues(alpha: 0.12 + pulse * 0.18)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 18 + pulse * 8
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 16);
    canvas.drawCircle(Offset(cx, cy), radius, glowPaint);

    // Solid ring border
    final ringPaint = Paint()
      ..color = AppColors.accent.withValues(alpha: 0.35 + pulse * 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(Offset(cx, cy), radius, ringPaint);

    // Tick marks
    final tickPaint = Paint()
      ..color = AppColors.accent.withValues(alpha: 0.25)
      ..strokeWidth = 1;
    for (int i = 0; i < 12; i++) {
      final angle = (i / 12) * 2 * 3.14159;
      final inner = radius - 6;
      final outer = radius;
      canvas.drawLine(
        Offset(cx + inner * _cos(angle), cy + inner * _sin(angle)),
        Offset(cx + outer * _cos(angle), cy + outer * _sin(angle)),
        tickPaint,
      );
    }

    // Radar sweep
    final sweepAngle = scan * 2 * 3.14159 - 3.14159 / 2;
    final sweepPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          AppColors.accent.withValues(alpha: 0.55),
          AppColors.accent.withValues(alpha: 0.0),
        ],
      ).createShader(Rect.fromCircle(
          center: Offset(cx, cy), radius: radius))
      ..style = PaintingStyle.fill;
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: radius - 2),
      sweepAngle - 0.8,
      0.8,
      true,
      sweepPaint,
    );

    // Radar line
    final linePaint = Paint()
      ..color = AppColors.accent.withValues(alpha: 0.9)
      ..strokeWidth = 1.5;
    canvas.drawLine(
      Offset(cx, cy),
      Offset(
        cx + (radius - 2) * _cos(sweepAngle),
        cy + (radius - 2) * _sin(sweepAngle),
      ),
      linePaint,
    );

    // Center dot
    canvas.drawCircle(
      Offset(cx, cy),
      3,
      Paint()..color = AppColors.accent.withValues(alpha: 0.7 + pulse * 0.3),
    );
  }

  double _cos(double a) => math.cos(a);
  double _sin(double a) => math.sin(a);

  @override
  bool shouldRepaint(_OwlRingPainter o) =>
      o.pulse != pulse || o.scan != scan;
}

// ── Inline blinking cursor for the typewriter
class _InlineCursor extends StatefulWidget {
  @override
  State<_InlineCursor> createState() => _InlineCursorState();
}

class _InlineCursorState extends State<_InlineCursor>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 530))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
        opacity: _c,
        child: Container(
          width: 8,
          height: 14,
          margin: const EdgeInsets.only(left: 3),
          decoration: BoxDecoration(
            color: AppColors.accent,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      );
}

// ================================================================
//  Landing Page
// ================================================================

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});
  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> with TickerProviderStateMixin {
  final _scroll = ScrollController();
  late final AnimationController _glow;
  late final AnimationController _hero;
  late final Animation<double> _fade;
  late final Animation<Offset> _textSlide;
  late final Animation<Offset> _ideSlide;

  @override
  void initState() {
    super.initState();
    _glow = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2800))
      ..repeat(reverse: true);
    _hero = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1200));
    _fade = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(
        parent: _hero, curve: const Interval(0, 0.65, curve: Curves.easeOut)));
    _textSlide = Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero)
        .animate(CurvedAnimation(
            parent: _hero,
            curve: const Interval(0, 0.65, curve: Curves.easeOut)));
    _ideSlide = Tween<Offset>(begin: const Offset(0, 0.12), end: Offset.zero)
        .animate(CurvedAnimation(
            parent: _hero,
            curve: const Interval(0.2, 1, curve: Curves.easeOut)));
    Future.delayed(const Duration(milliseconds: 120), () {
      if (mounted) _hero.forward();
    });
  }

  @override
  void dispose() {
    _glow.dispose();
    _hero.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          SingleChildScrollView(
            controller: _scroll,
            child: Column(
              children: [
                const SizedBox(height: 64),
                HeroSection(
                    fade: _fade,
                    textSlide: _textSlide,
                    ideSlide: _ideSlide,
                    glow: _glow),
                const MetricBanner(),
                const BentoSection(),
                const CtaFooter(),
              ],
            ),
          ),
          NavBar(scroll: _scroll),
        ],
      ),
    );
  }
}

// ================================================================
//  SECTION 1: NavBar
// ================================================================

class NavBar extends StatefulWidget {
  final ScrollController scroll;
  const NavBar({super.key, required this.scroll});
  @override
  State<NavBar> createState() => _NavBarState();
}

class _NavBarState extends State<NavBar> {
  bool _scrolled = false;

  @override
  void initState() {
    super.initState();
    widget.scroll.addListener(() {
      final s = widget.scroll.offset > 10;
      if (s != _scrolled) setState(() => _scrolled = s);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            height: 64,
            decoration: BoxDecoration(
              color: _scrolled
                  ? AppColors.background.withOpacity(0.88)
                  : AppColors.background.withOpacity(0.55),
              border: Border(
                bottom: BorderSide(
                  color: _scrolled
                      ? AppColors.border
                      : AppColors.border.withOpacity(0),
                ),
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                const OwlLogo(),
                const Spacer(),
                if (R.desktop(context)) ...[
                  _NavLink('Features', () {}),
                  const SizedBox(width: 28),
                  _NavLink('GitHub', () => launch(AppLinks.githubRepo)),
                  const SizedBox(width: 28),
                ],
                _CtaBtn(
                    label: 'Download .zip',
                    icon: Icons.download_rounded,
                    onTap: () => launch(AppLinks.downloadZip)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class OwlLogo extends StatelessWidget {
  const OwlLogo({super.key});
  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: AppColors.accent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
                color: AppColors.accent.withOpacity(0.4), blurRadius: 12)
          ],
        ),
        child:
            Center(child: SvgPicture.asset('assets/OWL.svg', width: 22, height: 22)),
      ),
      const SizedBox(width: 10),
      const Text('RepoOwl',
          style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              letterSpacing: -0.3)),
    ]);
  }
}

class _NavLink extends StatefulWidget {
  final String label;
  final VoidCallback onTap;
  const _NavLink(this.label, this.onTap);
  @override
  State<_NavLink> createState() => _NavLinkState();
}

class _NavLinkState extends State<_NavLink> {
  bool _h = false;
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _h = true),
      onExit: (_) => setState(() => _h = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 150),
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: _h ? AppColors.textPrimary : AppColors.textSecondary,
          ),
          child: Text(widget.label),
        ),
      ),
    );
  }
}

class _CtaBtn extends StatefulWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool outlined;
  final double fontSize;
  const _CtaBtn({
    required this.label,
    required this.icon,
    required this.onTap,
    this.outlined = false,
    this.fontSize = 13,
  });
  @override
  State<_CtaBtn> createState() => _CtaBtnState();
}

class _CtaBtnState extends State<_CtaBtn> {
  bool _h = false;
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _h = true),
      onExit: (_) => setState(() => _h = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: EdgeInsets.symmetric(
              horizontal: widget.fontSize > 14 ? 24 : 18,
              vertical: widget.fontSize > 14 ? 14 : 9),
          decoration: BoxDecoration(
            color: widget.outlined
                ? (_h ? AppColors.surface : Colors.transparent)
                : (_h ? AppColors.accent.withOpacity(0.85) : AppColors.accent),
            border: Border.all(
              color: widget.outlined ? AppColors.border : Colors.transparent,
            ),
            borderRadius: BorderRadius.circular(10),
            boxShadow: (!widget.outlined && _h)
                ? [
                    BoxShadow(
                        color: AppColors.accent.withOpacity(0.45),
                        blurRadius: 20,
                        spreadRadius: 2)
                  ]
                : [],
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(widget.icon,
                size: widget.fontSize + 2,
                color: widget.outlined ? AppColors.textPrimary : Colors.white),
            const SizedBox(width: 8),
            Text(widget.label,
                style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: widget.fontSize,
                    fontWeight: FontWeight.w600,
                    color: widget.outlined
                        ? AppColors.textPrimary
                        : Colors.white)),
          ]),
        ),
      ),
    );
  }
}

// ================================================================
//  SECTION 2: Hero Section
// ================================================================

class HeroSection extends StatelessWidget {
  final Animation<double> fade;
  final Animation<Offset> textSlide;
  final Animation<Offset> ideSlide;
  final AnimationController glow;
  const HeroSection(
      {super.key,
      required this.fade,
      required this.textSlide,
      required this.ideSlide,
      required this.glow});

  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
          horizontal: mob ? 20 : 48, vertical: mob ? 56 : 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(children: [
            FadeTransition(
              opacity: fade,
              child:
                  SlideTransition(position: textSlide, child: _HeroText()),
            ),
            SizedBox(height: mob ? 48 : 64),
            FadeTransition(
              opacity: fade,
              child: SlideTransition(
                position: ideSlide,
                child: IdeMockup(glow: glow),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

class _HeroText extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    return Column(children: [
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: AppColors.accent.withOpacity(0.1),
          border: Border.all(color: AppColors.accent.withOpacity(0.35)),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                  color: AppColors.accent, shape: BoxShape.circle)),
          const SizedBox(width: 7),
          const Text('Now with LLaMA 3.3 Support',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.accent)),
        ]),
      ),
      const SizedBox(height: 24),
      Text(
        mob
            ? 'Cut GitHub issue\ntriage time in half,\nInstantly.'
            : 'Cut GitHub issue triage\ntime in half, Instantly.',
        textAlign: TextAlign.center,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: mob ? 36 : 62,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
          height: 1.12,
          letterSpacing: -1.5,
        ),
      ),
      const SizedBox(height: 20),
      ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560),
        child: Text(
          'AI-powered, client-side duplicate detection directly in your browser. Zero server costs. Absolute data privacy.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: mob ? 15 : 17,
            color: AppColors.textSecondary,
            height: 1.65,
          ),
        ),
      ),
      const SizedBox(height: 36),
      Wrap(
        alignment: WrapAlignment.center,
        spacing: 12,
        runSpacing: 12,
        children: [
          _CtaBtn(
              label: 'Download Extension',
              icon: Icons.download_rounded,
              onTap: () => launch(AppLinks.downloadZip),
              fontSize: 15),
          _CtaBtn(
              label: 'View Source on GitHub',
              icon: Icons.code_rounded,
              onTap: () => launch(AppLinks.githubRepo),
              outlined: true,
              fontSize: 15),
        ],
      ),
    ]);
  }
}

// ── IDE Mockup ──

class IdeMockup extends StatefulWidget {
  final AnimationController glow;
  const IdeMockup({super.key, required this.glow});
  @override
  State<IdeMockup> createState() => _IdeMockupState();
}

class _IdeMockupState extends State<IdeMockup>
    with SingleTickerProviderStateMixin {
  late final AnimationController _type;
  late final Animation<int> _chars;
  static const _text =
      'App crashes on login when\noffline mode is enabled...';
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _type = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2400));
    _chars = IntTween(begin: 0, end: _text.length)
        .animate(CurvedAnimation(parent: _type, curve: Curves.easeInOut));
    _type.forward().then((_) => _restart());
  }

  void _restart() {
    _timer = Timer(const Duration(seconds: 2), () {
      if (mounted) {
        _type.reset();
        _type.forward().then((_) => _restart());
      }
    });
  }

  @override
  void dispose() {
    _type.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    return AnimatedBuilder(
      animation: widget.glow,
      builder: (_, __) {
        final blur = 20 + widget.glow.value * 28.0;
        final op = 0.25 + widget.glow.value * 0.3;
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                  color: AppColors.accent.withOpacity(op),
                  blurRadius: blur,
                  spreadRadius: 1),
              BoxShadow(
                  color: AppColors.accentBlue.withOpacity(op * 0.5),
                  blurRadius: blur * 1.4),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1C2028),
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                _IdeTitleBar(),
                const Divider(height: 1, thickness: 1, color: AppColors.border),
                mob
                    ? Column(children: [
                        _IdeLeft(chars: _chars),
                        const Divider(
                            height: 1,
                            thickness: 1,
                            color: AppColors.border),
                        _IdeRight(glow: widget.glow),
                      ])
                    : IntrinsicHeight(
                        child: Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Expanded(flex: 5, child: _IdeLeft(chars: _chars)),
                              const VerticalDivider(
                                  width: 1,
                                  thickness: 1,
                                  color: AppColors.border),
                              Expanded(
                                  flex: 5, child: _IdeRight(glow: widget.glow)),
                            ]),
                      ),
              ]),
            ),
          ),
        );
      },
    );
  }
}

class _IdeTitleBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      color: const Color(0xFF161B22),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(children: [
        _Dot(AppColors.terminalRed),
        const SizedBox(width: 7),
        _Dot(AppColors.terminalYellow),
        const SizedBox(width: 7),
        _Dot(AppColors.terminalGreen),
        const SizedBox(width: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(5),
            border: Border.all(color: AppColors.border),
          ),
          child: const Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.folder_outlined,
                size: 12, color: AppColors.textSecondary),
            SizedBox(width: 5),
            Text('repoowl / triage.ts',
                style: TextStyle(
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    color: AppColors.textSecondary)),
          ]),
        ),
        const Spacer(),
        const Icon(Icons.circle, size: 8, color: AppColors.accent),
      ]),
    );
  }
}

class _Dot extends StatelessWidget {
  final Color color;
  const _Dot(this.color);
  @override
  Widget build(BuildContext context) => Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle));
}

class _IdeLeft extends StatelessWidget {
  final Animation<int> chars;
  const _IdeLeft({required this.chars});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.bug_report_outlined,
              size: 14, color: AppColors.accentBlue),
          const SizedBox(width: 6),
          const Text('New Issue',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.accentBlue)),
        ]),
        const SizedBox(height: 14),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.border),
          ),
          child: const Text('App crashes on login',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary)),
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          constraints: const BoxConstraints(minHeight: 80),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(6),
            border:
                Border.all(color: AppColors.accentBlue.withOpacity(0.5)),
          ),
          child: AnimatedBuilder(
            animation: chars,
            builder: (_, __) {
              final txt =
                  'App crashes on login when\noffline mode is enabled...'
                      .substring(0, chars.value);
              return Text.rich(TextSpan(children: [
                TextSpan(
                    text: txt,
                    style: const TextStyle(
                        fontFamily: 'JetBrains Mono',
                        fontSize: 12,
                        color: AppColors.textPrimary,
                        height: 1.6)),
                WidgetSpan(child: _Cursor()),
              ]));
            },
          ),
        ),
        const SizedBox(height: 14),
        Row(children: [
          _Tag('bug', AppColors.terminalRed),
          const SizedBox(width: 6),
          _Tag('mobile', AppColors.purple),
          const SizedBox(width: 6),
          _Tag('auth', AppColors.terminalYellow),
        ]),
        const SizedBox(height: 16),
        _ProgressBar(),
      ]),
    );
  }
}

class _Cursor extends StatefulWidget {
  @override
  State<_Cursor> createState() => _CursorState();
}

class _CursorState extends State<_Cursor> with SingleTickerProviderStateMixin {
  late final AnimationController _c;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 530))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
        opacity: _c,
        child: Transform.translate(
            offset: const Offset(0, 2),
            child: Container(
                width: 1.5,
                height: 14,
                color: AppColors.accentBlue)),
      );
}

class _Tag extends StatelessWidget {
  final String label;
  final Color color;
  const _Tag(this.label, this.color);
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          border: Border.all(color: color.withOpacity(0.35)),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(label,
            style: TextStyle(
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
                color: color,
                fontWeight: FontWeight.w600)),
      );
}

class _ProgressBar extends StatefulWidget {
  @override
  State<_ProgressBar> createState() => _ProgressBarState();
}

class _ProgressBarState extends State<_ProgressBar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;
  late final Animation<double> _a;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2600));
    _a = CurvedAnimation(parent: _c, curve: Curves.easeInOut);
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) _c.forward();
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _a,
        builder: (_, __) =>
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.auto_awesome, size: 12, color: AppColors.accent),
            const SizedBox(width: 5),
            Text(
                'Analyzing with RepoOwl\u2026 ${(_a.value * 100).toInt()}%',
                style: const TextStyle(
                    fontFamily: 'JetBrains Mono',
                    fontSize: 10,
                    color: AppColors.textSecondary)),
          ]),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: _a.value,
              minHeight: 3,
              backgroundColor: AppColors.border,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppColors.accent),
            ),
          ),
        ]),
      );
}

class _IdeRight extends StatelessWidget {
  final AnimationController glow;
  const _IdeRight({required this.glow});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0D1117),
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          AnimatedBuilder(
            animation: glow,
            builder: (_, __) => Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accent,
                boxShadow: [
                  BoxShadow(
                      color: AppColors.accent
                          .withOpacity(0.4 + glow.value * 0.4),
                      blurRadius: 6 + glow.value * 8)
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          const Text('RepoOwl Insight',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.accent)),
        ]),
        const SizedBox(height: 14),
        _AlertCard(glow: glow),
        const SizedBox(height: 14),
        _SimBar('Semantic similarity', 0.92),
        const SizedBox(height: 8),
        _SimBar('Title match', 0.78),
        const SizedBox(height: 8),
        _SimBar('Label overlap', 0.67),
        const SizedBox(height: 16),
        Row(children: [
          _Chip('Mark Duplicate', AppColors.accent),
          const SizedBox(width: 8),
          _Chip('View #42', AppColors.accentBlue),
        ]),
      ]),
    );
  }
}

class _AlertCard extends StatelessWidget {
  final AnimationController glow;
  const _AlertCard({required this.glow});
  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: glow,
        builder: (_, __) => Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.accent.withOpacity(0.07),
            border: Border.all(
                color: AppColors.accent
                    .withOpacity(0.3 + glow.value * 0.25)),
            borderRadius: BorderRadius.circular(8),
          ),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Text('\u26a0\ufe0f', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 7),
              const Text('Duplicate Detected',
                  style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.accent)),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4)),
                child: const Text('92%',
                    style: TextStyle(
                        fontFamily: 'JetBrains Mono',
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accent)),
              ),
            ]),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(5)),
              child: const Text.rich(TextSpan(children: [
                TextSpan(
                    text: 'Matches Issue ',
                    style: TextStyle(
                        fontFamily: 'JetBrains Mono',
                        fontSize: 11,
                        color: AppColors.textSecondary)),
                TextSpan(
                    text: '#42',
                    style: TextStyle(
                        fontFamily: 'JetBrains Mono',
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accentBlue)),
                TextSpan(
                    text: '\n"Login fatal error on offline mode"',
                    style: TextStyle(
                        fontFamily: 'JetBrains Mono',
                        fontSize: 11,
                        color: AppColors.textPrimary)),
              ])),
            ),
          ]),
        ),
      );
}

class _SimBar extends StatelessWidget {
  final String label;
  final double value;
  const _SimBar(this.label, this.value);
  @override
  Widget build(BuildContext context) =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label,
              style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  color: AppColors.textSecondary)),
          Text('${(value * 100).toInt()}%',
              style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 10,
                  color: AppColors.terminalGreen)),
        ]),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(2),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 3,
            backgroundColor: AppColors.border,
            valueColor: AlwaysStoppedAnimation<Color>(
                value > 0.85 ? AppColors.accent : AppColors.terminalGreen),
          ),
        ),
      ]);
}

class _Chip extends StatefulWidget {
  final String label;
  final Color color;
  const _Chip(this.label, this.color);
  @override
  State<_Chip> createState() => _ChipState();
}

class _ChipState extends State<_Chip> {
  bool _h = false;
  @override
  Widget build(BuildContext context) => MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _h = true),
        onExit: (_) => setState(() => _h = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding:
              const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: widget.color.withOpacity(_h ? 0.2 : 0.1),
            border: Border.all(color: widget.color.withOpacity(0.4)),
            borderRadius: BorderRadius.circular(5),
          ),
          child: Text(widget.label,
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: widget.color)),
        ),
      );
}

// ================================================================
//  SECTION 3: Metric Banner
// ================================================================

class MetricBanner extends StatelessWidget {
  const MetricBanner({super.key});

  static const _items = [
    ('100%', 'Client-Side'),
    (r'$0', 'Server Costs'),
    ('LLaMA 3.3', 'AI Engine'),
    ('Apache 2.0', 'Open Source'),
  ];

  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
          vertical: mob ? 36 : 48, horizontal: mob ? 20 : 48),
      decoration: const BoxDecoration(
        border: Border.symmetric(
            horizontal: BorderSide(color: AppColors.border)),
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            AppColors.background,
            Color(0xFF0F1318),
            AppColors.background,
          ],
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: mob
              ? Column(
                  children: _items
                      .map((i) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: _MetricItem(i.$1, i.$2)))
                      .toList())
              : Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    for (int i = 0; i < _items.length; i++) ...[
                      _MetricItem(_items[i].$1, _items[i].$2),
                      if (i < _items.length - 1)
                        Container(
                            height: 40, width: 1, color: AppColors.border),
                    ],
                  ],
                ),
        ),
      ),
    );
  }
}

class _MetricItem extends StatelessWidget {
  final String value;
  final String label;
  const _MetricItem(this.value, this.label);
  @override
  Widget build(BuildContext context) => Column(children: [
        Text(value,
            style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                letterSpacing: -0.5)),
        const SizedBox(height: 4),
        Text(label,
            style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                color: AppColors.textSecondary)),
      ]);
}

// ================================================================
//  SECTION 4: Bento Grid
// ================================================================

class BentoSection extends StatelessWidget {
  const BentoSection({super.key});

  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    final tab = R.tablet(context);
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
          horizontal: mob ? 20 : 48, vertical: mob ? 56 : 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _Label('Features'),
            const SizedBox(height: 12),
            Text('Faster triage + better code',
                style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: mob ? 28 : 40,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: -1)),
            const SizedBox(height: 8),
            const Text(
                'Everything you need to ship better software, faster.',
                style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 15,
                    color: AppColors.textSecondary)),
            const SizedBox(height: 48),
            if (mob) ...[
              _BYOKCard(),
              const SizedBox(height: 16),
              _DualLayerCard(),
              const SizedBox(height: 16),
              _SupabaseCard(),
              const SizedBox(height: 16),
              _OmniPromptCard(),
            ] else if (tab) ...[
              Row(children: [
                Expanded(child: _BYOKCard()),
                const SizedBox(width: 16),
                Expanded(child: _DualLayerCard())
              ]),
              const SizedBox(height: 16),
              Row(children: [
                Expanded(child: _SupabaseCard()),
                const SizedBox(width: 16),
                Expanded(child: _OmniPromptCard())
              ]),
            ] else ...[
              IntrinsicHeight(
                child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(flex: 6, child: _BYOKCard()),
                      const SizedBox(width: 16),
                      Expanded(flex: 4, child: _DualLayerCard()),
                    ]),
              ),
              const SizedBox(height: 16),
              IntrinsicHeight(
                child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(flex: 4, child: _SupabaseCard()),
                      const SizedBox(width: 16),
                      Expanded(flex: 6, child: _OmniPromptCard()),
                    ]),
              ),
            ],
          ]),
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.accentBlue.withOpacity(0.1),
          border:
              Border.all(color: AppColors.accentBlue.withOpacity(0.3)),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(text.toUpperCase(),
            style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.accentBlue,
                letterSpacing: 1.2)),
      );
}

class _Card extends StatefulWidget {
  final Widget child;
  final Color accent;
  final double minH;
  const _Card({required this.child, required this.accent, this.minH = 200});
  @override
  State<_Card> createState() => _CardState();
}

class _CardState extends State<_Card> {
  bool _h = false;
  @override
  Widget build(BuildContext context) => MouseRegion(
        onEnter: (_) => setState(() => _h = true),
        onExit: (_) => setState(() => _h = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          constraints: BoxConstraints(minHeight: widget.minH),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: _h ? const Color(0xFF1A2030) : AppColors.surface,
            border: Border.all(
                color: _h
                    ? widget.accent.withOpacity(0.45)
                    : AppColors.border),
            borderRadius: BorderRadius.circular(14),
            gradient: _h
                ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [widget.accent.withOpacity(0.05), Colors.transparent])
                : null,
            boxShadow: _h
                ? [
                    BoxShadow(
                        color: widget.accent.withOpacity(0.12),
                        blurRadius: 20,
                        spreadRadius: 1)
                  ]
                : [],
          ),
          child: widget.child,
        ),
      );
}

class _CardIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  const _CardIcon(this.icon, this.color);
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          border: Border.all(color: color.withOpacity(0.3)),
          borderRadius: BorderRadius.circular(9),
        ),
        child: Icon(icon, color: color, size: 20),
      );
}

class _BYOKCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) => _Card(
        accent: AppColors.accent,
        minH: 230,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            _CardIcon(Icons.key_rounded, AppColors.accent),
            const SizedBox(width: 12),
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('BYOK Architecture',
                  style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary)),
              Text('Bring Your Own Key',
                  style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: AppColors.textSecondary)),
            ]),
          ]),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border)),
            child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _DNode('Your Key', '\ud83d\udd11', AppColors.accent),
                  const _Arrow(),
                  _DNode('Browser', '\ud83c\udf10', AppColors.accentBlue),
                  const _Arrow(),
                  _DNode('LLM API', '\ud83e\udd16', AppColors.terminalGreen),
                ]),
          ),
          const SizedBox(height: 16),
          const Text(
              'Your API keys never leave your machine. All AI inference happens directly in the browser sandbox — zero telemetry, zero risk.',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.6)),
        ]),
      );
}

class _DNode extends StatelessWidget {
  final String label, emoji;
  final Color color;
  const _DNode(this.label, this.emoji, this.color);
  @override
  Widget build(BuildContext context) => Column(children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            border: Border.all(color: color.withOpacity(0.35)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(child: Text(emoji, style: const TextStyle(fontSize: 18))),
        ),
        const SizedBox(height: 5),
        Text(label,
            style: const TextStyle(
                fontFamily: 'JetBrains Mono',
                fontSize: 9,
                color: AppColors.textSecondary)),
      ]);
}

class _Arrow extends StatelessWidget {
  const _Arrow();
  @override
  Widget build(BuildContext context) => const Row(children: [
        SizedBox(
            width: 12, child: Divider(color: AppColors.border, thickness: 1)),
        Icon(Icons.arrow_forward_ios_rounded,
            size: 10, color: AppColors.border),
      ]);
}

class _DualLayerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) => _Card(
        accent: AppColors.accentBlue,
        minH: 230,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _CardIcon(Icons.layers_rounded, AppColors.accentBlue),
          const SizedBox(height: 14),
          const Text('Dual-Layer Sync',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          const Text(
              'Issues indexed in your Hub, analyzed in the Sandbox.',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  height: 1.5)),
          const SizedBox(height: 16),
          _FlowBox('Hub (IndexedDB)', 'Persistent issue store',
              AppColors.accentBlue, Icons.storage_rounded),
          const SizedBox(height: 6),
          const Center(
              child: Icon(Icons.arrow_downward_rounded,
                  size: 14, color: AppColors.border)),
          const SizedBox(height: 6),
          _FlowBox('Sandbox (Worker)', 'Isolated AI runtime',
              AppColors.terminalGreen, Icons.science_rounded),
        ]),
      );
}

class _FlowBox extends StatelessWidget {
  final String label, sub;
  final Color color;
  final IconData icon;
  const _FlowBox(this.label, this.sub, this.color, this.icon);
  @override
  Widget build(BuildContext context) => Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
        decoration: BoxDecoration(
          color: color.withOpacity(0.07),
          border: Border.all(color: color.withOpacity(0.3)),
          borderRadius: BorderRadius.circular(7),
        ),
        child: Row(children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 9),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label,
                style: TextStyle(
                    fontFamily: 'JetBrains Mono',
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: color)),
            Text(sub,
                style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 9,
                    color: AppColors.textSecondary)),
          ]),
        ]),
      );
}

class _SupabaseCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) => _Card(
        accent: AppColors.terminalGreen,
        minH: 230,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            _CardIcon(Icons.bolt_rounded, AppColors.terminalGreen),
            const SizedBox(width: 12),
            const Text('Supabase Native',
                style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary)),
          ]),
          const SizedBox(height: 14),
          const Text(
              'Serverless RLS policies and real-time sync — no backend code to maintain.',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  height: 1.55)),
          const SizedBox(height: 16),
          _Code([
            ('-- Row Level Security', AppColors.textSecondary),
            ('CREATE POLICY "user_owns_data"', AppColors.textPrimary),
            ('  ON issues FOR ALL', AppColors.textPrimary),
            ('  USING (auth.uid() = user_id);', AppColors.terminalGreen),
          ]),
        ]),
      );
}

class _OmniPromptCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) => _Card(
        accent: AppColors.purple,
        minH: 230,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            _CardIcon(Icons.psychology_rounded, AppColors.purple),
            const SizedBox(width: 12),
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Omni-Prompt Engine',
                  style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary)),
              Text('Structured JSON schema',
                  style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: AppColors.textSecondary)),
            ]),
          ]),
          const SizedBox(height: 16),
          _Code([
            ('{', AppColors.border),
            ('  "model": "llama3.3",', AppColors.textPrimary),
            ('  "task": "duplicate_detect",', AppColors.textPrimary),
            ('  "threshold": 0.85,', AppColors.accent),
            ('  "privacy_mode": true', AppColors.terminalGreen),
            ('}', AppColors.border),
          ]),
          const SizedBox(height: 14),
          const Text(
              "Plug in any OpenAI-compatible API. The prompt schema adapts automatically to your model's context window.",
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  height: 1.55)),
        ]),
      );
}

class _Code extends StatelessWidget {
  final List<(String, Color)> lines;
  const _Code(this.lines);
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(7),
            border: Border.all(color: AppColors.border)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: lines
              .map((l) => Text(l.$1,
                  style: TextStyle(
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                      color: l.$2,
                      height: 1.65)))
              .toList(),
        ),
      );
}

// ================================================================
//  SECTION 5: CTA + Footer
// ================================================================

class CtaFooter extends StatelessWidget {
  const CtaFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(children: [_CtaSection(), _Footer()]);
  }
}

class _CtaSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
          horizontal: mob ? 20 : 48, vertical: mob ? 72 : 100),
      decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.border))),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: Column(children: [
            Text('Get started in 2 clicks.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: mob ? 32 : 52,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: -1.2)),
            const SizedBox(height: 16),
            const Text(
                'No account. No server. No data collection.\nJust drop it in Chrome and triage smarter.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    color: AppColors.textSecondary,
                    height: 1.6)),
            const SizedBox(height: 44),
            _PulseBtn(),
            const SizedBox(height: 20),
            Text(
                'Free forever  \u00b7  Apache 2.0 Licensed  \u00b7  Open Source',
                style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: AppColors.textSecondary.withOpacity(0.65))),
          ]),
        ),
      ),
    );
  }
}

class _PulseBtn extends StatefulWidget {
  @override
  State<_PulseBtn> createState() => _PulseBtnState();
}

class _PulseBtnState extends State<_PulseBtn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;
  late final Animation<double> _p;
  bool _h = false;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1600))
      ..repeat(reverse: true);
    _p = CurvedAnimation(parent: _c, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _h = true),
      onExit: (_) => setState(() => _h = false),
      child: GestureDetector(
        onTap: () => launch(AppLinks.downloadZip),
        child: AnimatedBuilder(
          animation: _p,
          builder: (_, __) => Container(
            padding: EdgeInsets.symmetric(
                horizontal: mob ? 28 : 40, vertical: mob ? 16 : 20),
            decoration: BoxDecoration(
              color: _h
                  ? AppColors.accent.withOpacity(0.9)
                  : AppColors.accent,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                    color: AppColors.accent
                        .withOpacity(0.35 + _p.value * 0.3),
                    blurRadius: 24 + _p.value * 20,
                    spreadRadius: _p.value * 4),
                BoxShadow(
                    color: AppColors.accent.withOpacity(0.15),
                    blurRadius: 60),
              ],
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.download_rounded,
                  color: Colors.white, size: 22),
              const SizedBox(width: 12),
              Text('Download RepoOwl.zip',
                  style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: mob ? 16 : 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.2)),
            ]),
          ),
        ),
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final mob = R.mobile(context);
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
          horizontal: mob ? 20 : 48, vertical: 32),
      decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.border))),
      child: Stack(alignment: Alignment.center, children: [
        Text('REPOOWL',
            style: TextStyle(
                fontFamily: 'Inter',
                fontSize: mob ? 56 : 120,
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary.withOpacity(0.028),
                letterSpacing: 12)),
        Column(children: [
          mob
              ? Column(children: _links(mob))
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: _links(mob)),
          const SizedBox(height: 16),
          const Text('\u00a9 2026 RepoOwl. All rights reserved.',
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: AppColors.textSecondary)),
        ]),
      ]),
    );
  }

  List<Widget> _links(bool mob) {
    Widget sep() => mob
        ? const SizedBox(height: 8)
        : const Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: Text('\u00b7',
                style: TextStyle(color: AppColors.textSecondary)));
    return [
      _FLink('GitHub', AppLinks.githubRepo),
      sep(),
      _FLink('Apache 2.0 License', AppLinks.license),
      sep(),
      _FLink('View Source', AppLinks.githubRepo),
    ];
  }
}

class _FLink extends StatefulWidget {
  final String label;
  final String url;
  const _FLink(this.label, this.url);
  @override
  State<_FLink> createState() => _FLinkState();
}

class _FLinkState extends State<_FLink> {
  bool _h = false;
  @override
  Widget build(BuildContext context) => MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _h = true),
        onExit: (_) => setState(() => _h = false),
        child: GestureDetector(
          onTap: () => launch(widget.url),
          child: AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 150),
            style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                color: _h
                    ? AppColors.textPrimary
                    : AppColors.textSecondary),
            child: Text(widget.label),
          ),
        ),
      );
}
