<?php
$items = $page->entries()->toBlocks();
$query = get('q');
$results = $query ? $items->search($query, $search, ['words' => true]) : $items;
$list = $results->isNotEmpty() ? $results : $items;
?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main">
            <?php foreach ($page->sections()->toBlocks()->values() as $index => $block): ?>
                <?= snippet('blocks/split', ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
            <?php if ($items->isNotEmpty()): ?>
                <section class="section index-section">
                    <div class="index-heading">
                        <p class="index-counter"><?= $page->title()->esc() ?> · <?= $items->count() ?>     <?= t($count) ?></p>
                        <form class="search-wrapper" action="<?= $page->url() ?>" autocomplete="off">
                            <?php if ($results->isEmpty()): ?>
                                <p class="search-null">
                                    <?= t('search.null') ?>
                                </p>
                            <?php endif ?>
                            <input id="search" type="search" class="search-input<?= $results->isEmpty() ? ' null' : '' ?>"
                                name="q" value="<?= esc($query ?? '', 'attr') ?>">
                            <label for="search" class="search-label">
                                <span><?= t('library.search') ?></span>
                            </label>
                            <a href="<?= $page->url() ?>" type="reset" class="search-reset">Clear</a>
                        </form>
                    </div>
                    <ul class="index-list">
                        <?php foreach ($list as $entry): ?>
                            <?= snippet($item, ['block' => $entry]) ?>
                        <?php endforeach ?>
                    </ul>
                </section>
            <?php endif ?>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>