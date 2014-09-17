from fabric.api import local, settings, abort, run, cd



def deploy():
    with cd('webapps/commitcoffee/commitcoffee'):
        run("git pull")

    run('webapps/commitcoffee/apache2/bin/restart')
