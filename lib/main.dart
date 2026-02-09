import 'package:flutter/material.dart';
import 'package:ui_183/ui_183.dart';

void main() {
  UI183.init();
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return UI183.app183();
  }
}
