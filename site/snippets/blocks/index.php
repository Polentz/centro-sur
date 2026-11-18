<?php
/**
 * Index section: a searchable table of entries.
 * Each section on a page has its own search parameter, so several
 * tables can live on the same page and be searched independently.
 */
$items = $block->entries()->toBlocks();
if ($items->isEmpty())
    return;

$param = 'q-' . substr($block->id(), 0, 8);
$query = get($param);
$results = $query ? $items->search($query, 'title|info|category|date|extra', ['words' => true]) : $items;
$list = $results->isNotEmpty() ? $results : $items;
$anchor = 'index-' . substr($block->id(), 0, 8);
?>
<section class="section index-section" id="<?= $anchor ?>">
    <div class="index-heading">
        <p class="index-counter"><?= $block->title()->or($page->title())->esc() ?> · <?= $list->count() ?>
            <?= t('index.items') ?>
        </p>
        <form class="search-wrapper<?= $query ? ' is-active' : '' ?>" action="<?= $page->url() ?>#<?= $anchor ?>"
            autocomplete="off">
            <?php if ($results->isEmpty()): ?>
                <p class="search-null"><?= t('search.null') ?></p>
            <?php endif ?>
            <input id="search-<?= $anchor ?>" type="search"
                class="search-input<?= $results->isEmpty() ? ' null' : '' ?>" name="<?= $param ?>"
                value="<?= esc($query ?? '', 'attr') ?>">
            <label for="search-<?= $anchor ?>" class="search-label">
                <span><?= t('index.search') ?></span>
            </label>
            <a href="<?= $page->url() ?>#<?= $anchor ?>" class="search-reset"><?= t('search.reset') ?></a>
        </form>
    </div>
    <ul class="index-list">
        <?php foreach ($list as $entry): ?>
            <?= snippet('blocks/index-entry', ['block' => $entry]) ?>
        <?php endforeach ?>
    </ul>
</section>