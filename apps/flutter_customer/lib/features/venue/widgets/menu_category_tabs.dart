import 'package:flutter/material.dart';

class MenuCategoryTabs extends StatelessWidget {
  final List<String> categories;
  final TabController controller;

  const MenuCategoryTabs({
    super.key,
    required this.categories,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: TabBar(
        controller: controller,
        isScrollable: true,
        labelColor: Colors.black,
        unselectedLabelColor: Colors.grey,
        indicatorColor: Colors.black,
        indicatorWeight: 3,
        tabs: categories.map((c) => Tab(text: c)).toList(),
      ),
    );
  }
}
