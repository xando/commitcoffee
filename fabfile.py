from fabric.api import local, settings, abort, run, cd


def deploy():
    run('pip install https://github.com/xando/herbert/archive/master.zip --user --upgrade')
    with cd('webapps/herbert/progpac'):
        run("git pull")

    run('webapps/herbert/apache2/bin/restart')
