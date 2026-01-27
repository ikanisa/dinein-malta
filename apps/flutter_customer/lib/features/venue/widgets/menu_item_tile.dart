import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../../../core/data/models/menu.dart';
import '../../../../core/utils/currency.dart';

class MenuItemTile extends StatelessWidget {
  final MenuItem item;
  final VoidCallback onAdd;
  final String currencyCode;

  const MenuItemTile({
    super.key,
    required this.item,
    required this.onAdd,
    this.currencyCode = 'EUR',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: item.imageUrl != null 
          ? ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: item.imageUrl!,
                width: 60,
                height: 60,
                fit: BoxFit.cover,
                memCacheWidth: 120, // Optimization: Decode at needed size
                placeholder: (context, url) => Container(color: Colors.grey[200]),
                errorWidget: (context, url, error) => const Icon(Icons.broken_image, color: Colors.grey),
              ),
            )
          : null,
        title: Text(
          item.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (item.description != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  item.description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
              ),
            const SizedBox(height: 8),
            Row(
              children: [
                Text(
                  CurrencyUtils.format(item.price, currencyCode),
                  style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87),
                ),
                const Spacer(),
                if (!item.isAvailable)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('Sold Out', style: TextStyle(fontSize: 10)),
                  )
                else
                  InkWell(
                    onTap: onAdd,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: const Text(
                        'ADD',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blue),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
