<nav class="nav">
    <ul class="nav-wrapper">
        <?php foreach ($site->children()->listed() as $page): ?>
            <li class="nav-item"><a href="<?= $page->url() ?>"><?= $page->title() ?></a></li>
        <?php endforeach ?>
        <li class="nav-item"><a href="/">Buenos Aires</a></li>
        <li class="nav-item"><a href="/">The Residency</a></li>
        <li class="nav-item"><a href="/">Publishing</a></li>
        <li class="nav-item"><a href="/">Library</a></li>
        <li class="nav-item"><a href="/">Info</a></li>
    </ul>
</nav>