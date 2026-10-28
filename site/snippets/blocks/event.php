<?= snippet('index-entry', [
    'block' => $block,
    // Reuses the library columns: participants in the author slot, category in format, date in year
    'cells' => [
        'title' => $block->title()->value(),
        'author' => $block->participants()->value(),
        'format' => $block->category()->value(),
        'year' => $block->date()->isNotEmpty() ? $block->date()->toDate('d.m.Y') : '',
    ],
    'info' => $block->place()->value(),
]) ?>