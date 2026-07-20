// ignore_for_file: avoid_web_libraries_in_flutter
// This file is Flutter Web only — uses dart:html and dart:ui_web to embed
// a real <pre> element so the browser renders the ASCII art identically to
// assets/ascii-art.html (Courier New 11px / 12px line-height / letter-spacing 0).
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'ascii_art.dart';

/// Renders [owlAsciiArt] as an HTML `<pre>` element that covers its
/// parent container with a CSS `transform: scale(...)` — identical output
/// to opening assets/ascii-art.html directly in the browser.
class AsciiArtBackground extends StatefulWidget {
  /// Text colour for the art characters (default: #8B949E).
  final String cssColor;

  /// Overall opacity (0–1).
  final double opacity;

  const AsciiArtBackground({
    super.key,
    this.cssColor = '#8B949E',
    this.opacity = 0.2,
  });

  @override
  State<AsciiArtBackground> createState() => _AsciiArtBackgroundState();
}

class _AsciiArtBackgroundState extends State<AsciiArtBackground> {
  // Each instance gets a unique view-type so multiple usages don't collide.
  static int _counter = 0;
  late final String _viewType;

  @override
  void initState() {
    super.initState();
    _viewType = 'ascii-art-bg-${_counter++}';
    _registerView();
  }

  void _registerView() {
    final cssColor = widget.cssColor;
    final cssOpacity = widget.opacity.toStringAsFixed(2);

    ui_web.platformViewRegistry.registerViewFactory(_viewType, (int id) {
      // ── Container ────────────────────────────────────────────────────────
      // Fills the Flutter widget area; clips overflow so the scaled <pre>
      // doesn't bleed outside the section.
      final container = html.DivElement()
        ..style.width = '100%'
        ..style.height = '100%'
        ..style.overflow = 'hidden'
        ..style.position = 'relative'
        ..style.pointerEvents = 'none'; // let Flutter widgets above receive events

      // ── <pre> — exact CSS from ascii-art.html ────────────────────────────
      final pre = html.PreElement()
        ..style.fontFamily = '"Courier New", Courier, monospace'
        ..style.whiteSpace = 'pre'
        ..style.margin = '0'
        ..style.padding = '0'
        ..style.color = cssColor
        ..style.fontSize = '11px'
        ..style.lineHeight = '12px'
        ..style.letterSpacing = '0'
        ..style.opacity = cssOpacity
        ..style.position = 'absolute'
        ..style.top = '0'
        ..style.left = '0'
        ..style.transformOrigin = 'top left'
        ..text = owlAsciiArt;

      container.append(pre);

      // ── Cover-scale helper ───────────────────────────────────────────────
      // Equivalent of CSS object-fit: cover — scale so the art fills the
      // container on both axes (whichever axis requires more scaling wins).
      void applyScale([num? _]) {
        final cw = container.clientWidth.toDouble();
        final ch = container.clientHeight.toDouble();

        // Temporarily remove transform to read the art's natural pixel size.
        pre.style.transform = 'none';
        final pw = pre.scrollWidth.toDouble();
        final ph = pre.scrollHeight.toDouble();

        if (pw > 0 && ph > 0 && cw > 0 && ch > 0) {
          final scale = math.max(cw / pw, ch / ph);
          pre.style.transform = 'scale($scale)';
        } else {
          // Dimensions not ready yet — retry on next animation frame.
          html.window.requestAnimationFrame(applyScale);
        }
      }

      // Run on first paint and whenever the viewport resizes.
      html.window.onResize.listen((_) => applyScale());
      html.window.requestAnimationFrame(applyScale);

      return container;
    });
  }

  @override
  Widget build(BuildContext context) {
    return HtmlElementView(viewType: _viewType);
  }
}
