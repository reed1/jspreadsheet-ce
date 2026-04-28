# Krisna fork of jspreadsheet-ce

Downstream of [`jspreadsheet/ce`](https://github.com/jspreadsheet/ce). Tracks `upstream/master` and adds extensions used by the [krisna](../) Bappenas application.

## What's different from upstream

### `showAllDecimals` column option (default: `true`)

Stock jspreadsheet treats a numeric mask's decimal placeholders as a hard cap: a column with `mask: '0.00'` displays `1.2345` as `1.23`, even though the underlying stored value still carries `1.2345` (visible when you double-click into edit mode).

In this fork the presentation layer **expands** the mask's decimal section to fit every digit in the value. The mask's declared decimals still apply as a *minimum*, so trailing-zero padding works the same.

#### Examples

| Stored value | Mask | Stock display | Krisna fork display |
|---|---|---|---|
| `1.2345` | `0.00` | `1.23` | `1.2345` |
| `1.2` | `0.00` | `1.20` | `1.20` |
| `1234.56789` | `Rp #,##0.00` | `Rp 1,234.57` | `Rp 1,234.56789` |
| `-1.2345` | `0.00;-0.00` | `-1.23` | `-1.2345` |
| `12.5` | `#,##0` | `13` | `13` |

The integer-only mask is unaffected: with no decimal section in the mask, there is nothing to extend.

#### Opting out per column

Set `showAllDecimals: false` on the column to restore stock jspreadsheet trimming:

```js
columns: [
    { title: 'Allocation', type: 'numeric', mask: 'Rp #,##0.00' },                       // shows full precision
    { title: 'Rate',       type: 'numeric', mask: '0.00', showAllDecimals: false },      // trims to 2 decimals
]
```

#### What is *not* changed

- The underlying stored value (`getData`, `getValueFromCoords`) is untouched — this is purely a presentation-layer extension.
- Edit-mode behaviour is unchanged: double-clicking a cell still shows the raw value the way upstream does.
- Columns without `mask`, `format`, or `locale` go through no formatting at all and are unaffected.
- Locale-based numeric formatting already shows full precision in upstream when `maximumFractionDigits` is unset; the fork only bumps that ceiling if it was set lower than the value's precision.

## Implementation

Two source changes plus tests:

- `src/utils/internal.js` — adds `countDecimals` and `expandMaskDecimals` helpers; `getMask` sets `opt.autoExpand = (o.showAllDecimals !== false)`; `parseValue` invokes `expandMaskDecimals` when the flag is set.
- `test/decimalDisplay.js` — seven tests covering default-on, opt-out, signed masks, currency prefix, and the integer-mask no-op.

`src/utils/editor.js` is intentionally untouched — the mask string presented to the editor stays exactly as the user wrote it.

## Merging from upstream

```sh
git fetch upstream
git merge upstream/master
npm test
```

Conflict surface is small — the fork only touches `src/utils/internal.js` (`getMask` and `parseValue`).
