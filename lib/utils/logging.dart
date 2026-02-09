import 'package:logger/web.dart';

class Logging {
  static Logger logger = Logger(
    printer: PrettyPrinter(
      printEmojis: false,
      noBoxingByDefault: true,
      dateTimeFormat: DateTimeFormat.dateAndTime,
    ),
  );
}
