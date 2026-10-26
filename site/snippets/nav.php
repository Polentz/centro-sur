<nav class="nav" aria-label="Main">
    <ul class="nav-wrapper">
        <?php foreach ($site->children()->listed() as $item): ?>
            <li class="nav-item">
                <a href="<?= $item->url() ?>"<?= $item->isOpen() ? ' aria-current="page"' : '' ?>><?= $item->title()->esc() ?></a>
            </li>
        <?php endforeach ?>
    </ul>
</nav>
