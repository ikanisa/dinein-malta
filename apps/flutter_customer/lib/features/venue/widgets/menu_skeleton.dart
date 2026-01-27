import 'package:flutter/material.dart';
import 'package:skeletonizer/skeletonizer.dart';
import '../widgets/menu_item_tile.dart';
import '../../../../core/data/models/menu.dart';

class MenuSkeleton extends StatelessWidget {
  const MenuSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final dummyItem = MenuItem(
      id: '1',
      name: 'Delicious Item Name',
      description: 'Description of the delicious item goes here.',
      price: 15.0,
      isAvailable: true,
    );

    return Skeletonizer(
      enabled: true,
      child: ListView.builder(
        itemCount: 8,
        padding: const EdgeInsets.only(bottom: 100),
        itemBuilder: (context, index) {
          return MenuItemTile(
            item: dummyItem,
            onAdd: () {},
          );
        },
      ),
    );
  }
}
