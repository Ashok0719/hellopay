import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons_flutter.dart';
import 'package:provider/provider.dart';
import 'package:Hello_pay/providers/auth_provider.dart';
import 'package:Hello_pay/services/api_service.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:url_launcher/url_launcher.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  List<dynamic> _listings = [];
  bool _isLoadingListings = false;
  final ApiService _api = ApiService();

  @override
  void initState() {
    super.initState();
    _fetchListings();
  }

  Future<void> _fetchListings() async {
    setState(() => _isLoadingListings = true);
    try {
      final res = await _api.dio.get('/listings');
      setState(() => _listings = res.data);
    } catch (e) {
      debugPrint('Signal Lost: $e');
    } finally {
      setState(() => _isLoadingListings = false);
    }
  }

  Future<void> _handleClaim(String id) async {
    try {
      final res = await _api.dio.post('/listings/$id/claim');
      final intent = res.data['upiIntent'];
      if (await canLaunchUrl(Uri.parse(intent))) {
        await launchUrl(Uri.parse(intent));
      } else {
        _showToast('Gateway Failure: No UPI app found on node.');
      }
    } catch (e) {
      _showToast('Link Error: $e');
    }
  }

  void _showToast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchListings,
          color: Colors.indigoAccent,
          backgroundColor: const Color(0xFF0F172A),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   _buildHeader(user?['name'] ?? 'Neural Entity'),
                   const SizedBox(height: 32),
                   _buildBalanceCard(user?['walletBalance'] ?? 0),
                   const SizedBox(height: 48),
                   _buildMarketplaceLabel(),
                   const SizedBox(height: 20),
                   _isLoadingListings 
                    ? const Center(child: CircularProgressIndicator(color: Colors.indigo))
                    : _buildMarketplaceList(),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
      floatingActionButton: _buildScanButton(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildHeader(String name) {
    return FadeInDown(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'HelloPay',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: Colors.indigoAccent,
                  letterSpacing: 4,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Welcome, ${name.split(' ')[0]}',
                style: GoogleFonts.outfit(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -1,
                ),
              ),
            ],
          ),
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white10),
            ),
            child: const Icon(LucideIcons.bellRing, color: Colors.white24, size: 24),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceCard(dynamic balance) {
    return FadeInDown(
      delay: const Duration(milliseconds: 200),
      child: GlassmorphicContainer(
        width: double.infinity,
        height: 220,
        borderRadius: 40,
        blur: 20,
        alignment: Alignment.center,
        border: 1,
        linearGradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.indigo.withOpacity(0.4),
            Colors.indigo.withOpacity(0.05),
          ],
        ),
        borderGradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withOpacity(0.2),
            Colors.white.withOpacity(0.05),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
             Text(
                'COLLECTED YIELD',
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: Colors.white.withOpacity(0.4),
                  letterSpacing: 4,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '₹${balance.toString()}',
                style: GoogleFonts.outfit(
                  fontSize: 52,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  height: 1,
                  letterSpacing: -1,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                   _buildCardAction(LucideIcons.plus, 'Inject'),
                   const SizedBox(width: 16),
                   _buildCardAction(LucideIcons.send, 'Release'),
                ],
              )
          ],
        ),
      ),
    );
  }

  Widget _buildCardAction(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.indigo.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
           Icon(icon, color: Colors.white, size: 16),
           const SizedBox(width: 10),
           Text(
             label, 
             style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1)
           ),
        ],
      )
    );
  }

  Widget _buildMarketplaceLabel() {
    return FadeInUp(
      delay: const Duration(milliseconds: 400),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Active Marketplace',
            style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
          ),
          const Icon(LucideIcons.filter, color: Colors.white24, size: 20),
        ],
      ),
    );
  }

  Widget _buildMarketplaceList() {
    if (_listings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.only(top: 60),
          child: Text('NO NEURAL ASSETS DETECTED', style: GoogleFonts.outfit(color: Colors.white12, fontWeight: FontWeight.w900, letterSpacing: 2)),
        ),
      );
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _listings.length,
      itemBuilder: (context, index) {
        final item = _listings[index];
        return FadeInUp(
           delay: Duration(milliseconds: 500 + (index * 100)),
           child: Container(
            margin: const EdgeInsets.only(bottom: 20),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A).withOpacity(0.3),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.indigo.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.indigo.withOpacity(0.2)),
                  ),
                  child: const Icon(LucideIcons.package, color: Colors.indigoAccent, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['stockName'],
                        style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                      Text(
                        'By ${item['sellerId']['name']}',
                        style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white24),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () => _handleClaim(item['_id']),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.indigo,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  child: Text(
                    '₹${item['price']}',
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomNav() {
    return Container(
      height: 100,
      decoration: const BoxDecoration(
        color: Color(0xFF020617),
        border: Border(top: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(LucideIcons.layoutGrid, 0, 'CORE'),
          _buildNavItem(LucideIcons.history, 1, 'FEED'),
          const SizedBox(width: 48),
          _buildNavItem(LucideIcons.zap, 2, 'SELLER'),
          _buildNavItem(LucideIcons.user, 3, 'NODE'),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, int index, String label) {
    bool active = _currentIndex == index;
    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: active ? Colors.indigoAccent : Colors.white24, size: 24),
          const SizedBox(height: 6),
          Text(label, style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w900, color: active ? Colors.indigoAccent : Colors.white24, letterSpacing: 2)),
        ],
      ),
    );
  }

  Widget _buildScanButton() {
    return Container(
      width: 76,
      height: 76,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Colors.indigo, Colors.blueAccent]),
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFF020617), width: 8),
        boxShadow: [
          BoxShadow(color: Colors.indigo.withOpacity(0.5), blurRadius: 20, offset: const Offset(0, 5)),
        ],
      ),
      child: const Icon(LucideIcons.qrCode, color: Colors.white, size: 32),
    );
  }
}
