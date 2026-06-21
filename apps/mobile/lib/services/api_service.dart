import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://mp3juicepro-api.vercel.app/api';
  static const String packageName = 'com.mp3juice.pro';

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

  // Get Tracks inside Category
  static Future<List<dynamic>> fetchCategoryTracks(String slug) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/categories/tracks?slug=$slug&limit=20'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return data['data'] as List<dynamic>;
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
      final response = await http.get(Uri.parse('$baseUrl/search?q=${Uri.encodeComponent(query)}'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return data['data'] as List<dynamic>;
        }
      }
      return [];
    } catch (e) {
      print('Error searching tracks: $e');
      return [];
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
