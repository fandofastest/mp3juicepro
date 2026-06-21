import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  bool _isLoggedIn = false;
  String? _token;
  String? _username;
  String? _email;
  String? _errorMessage;
  bool _isLoading = false;

  AuthProvider() {
    _loadAuthData();
  }

  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;
  String? get username => _username;
  String? get email => _email;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  Future<void> _loadAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    _username = prefs.getString('auth_username');
    _email = prefs.getString('auth_email');
    _isLoggedIn = _token != null;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await ApiService.login(email, password);
    _isLoading = false;

    if (result != null && result.containsKey('accessToken')) {
      _token = result['accessToken'];
      // Extract username/user details if present in the response
      final user = result['user'] as Map<String, dynamic>?;
      _username = user?['username'] ?? 'Listener';
      _email = user?['email'] ?? email;
      _isLoggedIn = true;

      // Save to shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);
      await prefs.setString('auth_username', _username!);
      await prefs.setString('auth_email', _email!);

      notifyListeners();
      return true;
    } else {
      _errorMessage = result?['error'] ?? 'Login failed';
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String username, String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await ApiService.register(username, email, password);
    
    if (result != null && !result.containsKey('error')) {
      // Since register does not return a token, automatically log in the user
      final loginSuccess = await login(email, password);
      return loginSuccess;
    } else {
      _isLoading = false;
      _errorMessage = result?['error'] ?? 'Registration failed';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoggedIn = false;
    _token = null;
    _username = null;
    _email = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_username');
    await prefs.remove('auth_email');

    notifyListeners();
  }
}
