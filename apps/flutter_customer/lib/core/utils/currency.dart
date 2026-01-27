class CurrencyUtils {
  CurrencyUtils._();

  static String currencyCodeForCountry(String country) {
    switch (country.toUpperCase()) {
      case 'RW':
        return 'RWF';
      case 'MT':
        return 'EUR';
      default:
        return 'EUR';
    }
  }

  static String format(double amount, String currencyCode) {
    final code = currencyCode.toUpperCase();
    switch (code) {
      case 'EUR':
        return '€${amount.toStringAsFixed(2)}';
      case 'RWF':
        return 'RWF ${amount.toStringAsFixed(0)}';
      default:
        return '$code ${amount.toStringAsFixed(2)}';
    }
  }
}
