<?php
$from = $block->from()->isNotEmpty() ? $block->from()->toDate() : null;
$to = $block->to()->isNotEmpty() ? $block->to()->toDate() : null;

if ($from && $to && date('Y-m-d', $from) !== date('Y-m-d', $to)) {
    $start = date('Y', $from) === date('Y', $to) ? date('d.m', $from) : date('d.m.Y', $from);
    $dates = $start . ' – ' . date('d.m.Y', $to);
} else {
    $dates = ($from ?? $to) ? date('d.m.Y', $from ?? $to) : '';
}
?>
<?= snippet('index-entry', [
    'block' => $block,
    'cells' => [
        'title' => $block->title()->value(),
        'author' => $block->place()->value(),
        'format' => $block->category()->value(),
        'year' => $dates,
    ],
    'info' => $block->participants(),
]) ?>