import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:Hello_pay/services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoading = false;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    if (_token != null) {
      // Auto-load profile if token exists
      await fetchProfile();
    }
    notifyListeners();
  }

  Future<bool> sendOtp(String phone) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _apiService.dio.post('/auth/send-otp', data: {'phone': phone});
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyOtp(String phone, String otp, {String? name}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.dio.post('/auth/verify-otp', data: {
        'phone': phone,
        'otp': otp,
        'name': name,
      });
      _token = response.data['token'];
      _user = response.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.dio.post('/auth/register', data: data);
      _token = response.data['token'];
      _user = response.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchProfile() async {
    try {
      final response = await _apiService.dio.get('/auth/profile');
      _user = response.data;
      notifyListeners();
    } catch (e) {
      logout();
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }
}
