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
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _enterScale = Tween<double>(
      begin: 0.55,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _enter, curve: Curves.elasticOut));
    _enterFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _enter,
        curve: const Interval(0, 0.5, curve: Curves.easeIn),
      ),
    );

    // Pulse glow
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _pulseAnim = CurvedAnimation(parent: _pulse, curve: Curves.easeInOut);

    // Radar
    _scan = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
    _scanAngle = Tween<double>(begin: 0, end: 1).animate(_scan);

    // Typewriter
    _text = AnimationController(
      vsync: this,
      duration: Duration(
        milliseconds: (_statusMsg.length * 55).clamp(800, 2000),
      ),
    );
    _textChars = IntTween(
      begin: 0,
      end: _statusMsg.length,
    ).animate(CurvedAnimation(parent: _text, curve: Curves.easeOut));

    // Exit
    _exit = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _exitFade = Tween<double>(
      begin: 1,
      end: 0,
    ).animate(CurvedAnimation(parent: _exit, curve: Curves.easeIn));

    // Sequence
    _enter.forward().then((_) {
      _text.forward().then((_) {
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            _exit.forward().then((_) {
              if (mounted) setState(() => _done = true);
            }