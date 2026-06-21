import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://mp3juicepro-api.vercel.app/api';
  static const String packageName = 'com.mp3juice.mp3juicepro';

  // Fetch App Configuration (Ads, Safe Mode, App Update, etc.)
  static Future<Map<String, dynamic>> fetchAppConfig() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/app-config?packageName=$packageName'),
        headers: {
          'x-package-name': packageName,
        },
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('Fetched App Config Response: $data');
        if (data['success'] == true && data['data'] != null) {
          return data['data'] as Map<String, dynamic>;
        }
      }
      return {};
    } catch (e) {
      print('Error fetching app config: $e');
      return {};
    }
  }

  // Get Home Categories
  static Future<List<dynamic>> fetchCategories() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/categories'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return data['data'] as List<dynamic>;
        }
      }
      return [];
    } catch (e) {
      print('Error fetching categories: $e');
      return [];
    }
  }

  // Fetch dynamic home builder sections
  static Future<List<dynamic>> fetchHomeSections(String? token) async {
    try {
      final headers = <String, String>{};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      final response = await http.get(
        Uri.parse('$baseUrl/home'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return data['data'] as List<dynamic>;
        }
      }
      return [];
    } catch (e) {
      print('Error fetching home sections: $e');
      return [];
    }
  }

  static Future<List<dynamic>> fetchCategoryTracks(String slug) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/categories/tracks?slug=$slug&limit=20'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final resData = data['data'];
          if (resData is Map && resData.containsKey('tracks')) {
            return resData['tracks'] as List<dynamic>;
          } else if (resData is List) {
            return resData;
          }
        }
      }
      return [];
    } catch (e) {
      print('Error fetching category tracks: $e');
      return [];
    }
  }

  // Search Tracks
  static Future<List<dynamic>> searchTracks(String query) async {
    if (query.isEmpty) return [];
    try {
      final response = await http.get(Uri.parse('$baseUrl/search?q=${Uri.encodeComponent(query)}&provider=youtube'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final resData = data['data'];
          if (resData is Map && resData.containsKey('tracks')) {
            return resData['tracks'] as List<dynamic>;
          } else if (resData is List) {
            return resData;
          }
        }
      }
      return [];
    } catch (e) {
      print('Error searching tracks: $e');
      return [];
    }
  }

  // Login
  static Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );
      final data = json.decode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return data['data'] as Map<String, dynamic>;
      }
      return {'error': data['message'] ?? 'Authentication failed'};
    } catch (e) {
      return {'error': 'Network connection error'};
    }
  }

  // Register
  static Future<Map<String, dynamic>?> register(String username, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'username': username,
          'displayName': username,
          'email': email,
          'password': password
        }),
      );
      final data = json.decode(response.body);
      if ((response.statusCode == 200 || response.statusCode == 201) && data['success'] == true) {
        return data['data'] as Map<String, dynamic>;
      }
      return {'error': data['message'] ?? 'Registration failed'};
    } catch (e) {
      return {'error': 'Network connection error'};
    }
  }

  // Fetch Play / Stream URL
  static Future<Map<String, dynamic>?> fetchPlayLink(String vid) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/play?vid=$vid&packageName=$packageName'),
        headers: {
          'x-package-name': packageName,
        },
      );
      
      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        if (data['success'] == true && data['data'] != null) {
          return data['data'] as Map<String, dynamic>;
        }
      } else if (response.statusCode == 403) {
        return {
          'blocked': true,
          'message': data['message'] ?? 'Song playback is disabled (Safe Mode Active)',
        };
      }
      return null;
    } catch (e) {
      print('Error fetching play link: $e');
      return null;
    }
  }
}
