/**
 * Created by cromed on 3/14/16.
 */
var request = require('superagent');
var pmongo = require('promised-mongo');
var _ = require('underscore');

/**
 * Create a db connection to the given db name.
 * @returns {*|exports}
 */
var getDbConnection = function () {
    return pmongo('mongodb://localhost:27017/tally');
};

var db = getDbConnection();

var baseUrl = 'http://ucas-stash.lss.emc.com/rest/api/1.0'
var projectsUrl = baseUrl + '/projects';
var reposUrl = '/repos';
var commitsUrl = '/commits';

var clearDb = (function () {
    return db.collection('projects').drop().then(function () {
        return db.collection('repos').drop().then(function () {
            return db.collection('commits').drop().then(function () {
                console.log('db cleared');

            });
        });
    });

}());

var loadCommitsForRepo = function (repo) {
    if (!repo || !repo.project || !repo.project.link) {
        throw new Error('repo is not an object: ', repo);
        return;
    }
    var url = baseUrl + repo.project.link.url + '/repos/' + repo.slug + '/commits';
    console.log('URL IS: ', url);//console.log('URL IS: ', url);
    request.get(url, function (err, res) {
        if (err) throw err;
        var response = JSON.parse(res.text);
        var commits = response.values;
        commits.forEach(function (commit) {
            commit.repo = repo.slug;
            console.log(commit);
            db.collection('commits').insert(commit).then(function (message) {
                console.log('done', message);
            }).catch(function (err) {
                console.log('error: ', err);
            });
        });

    });
};

var loadReposForProject = function (project) {
    if (!project || !project.link) {
        throw new Error('project is not an object: ', project);
        return;
    }
    var url = baseUrl + project.link.url + reposUrl;
    console.log('URL IS: ', url);
    request.get(url, function (err, res) {
        if (err) throw err;
        var response = JSON.parse(res.text);
        var repos = response.values;
        repos = [_.last(repos)];//limiter
        repos.forEach(function(repo) {
            db.collection('repos').insert(repo).then(function (repo) {
                console.log('done', repo);
                loadCommitsForRepo(repo)
            }).catch(function (err) {
                console.log('error: ', err);
            });
        });

    });
};

var loadProjectsToMongo = function () {
    request.get(projectsUrl, function (err, res) {
        if (err) throw err;
        var response = JSON.parse(res.text);
        var projects = response.values;
        projects = [_.first(projects)];//limiter
        console.log('projects', projects);
        projects.forEach(function (project) {
            db.collection('projects').insert(project).then(function (project) {
                loadReposForProject(project);
            }).catch(function (err) {
                console.log('error: ', err);
            });
        });
    });
};

loadProjectsToMongo()

